import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, productsAPI } from '../../utils/api';
import { Package, Plus, Search, Edit2, Trash2, Tag, DollarSign, Filter, X, Save, Image as ImageIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';

function AdminProducts() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletedViews, setDeletedViews] = useState([]); // Track views to delete
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        categoryId: '',
        imageUrl: '',
        isActive: true
    });

    // Multi-View State
    const [views, setViews] = useState([
        { id: 'front', name: 'Front', file: null, preview: '' },
        { id: 'back', name: 'Back', file: null, preview: '' }
    ]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsRes = await adminAPI.getProducts();
            setProducts(productsRes.data.data || []);
            const categoriesRes = await productsAPI.getCategories();
            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data || []);
            }
        } catch (error) {
            console.error('Critical Error fetching data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (productSummary) => {
        // Fetch full product details including views
        try {
            const res = await productsAPI.getById(productSummary.id);
            const product = res.data.data;

            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                basePrice: product.base_price,
                categoryId: product.category_id,
                imageUrl: product.image_url,
                isActive: product.is_active === 1
            });

            // Populate active views
            const newViews = [
                { id: 'front', name: 'Front', file: null, preview: '' },
                { id: 'back', name: 'Back', file: null, preview: '' }
            ];

            // Map existing views
            if (product.views && Array.isArray(product.views)) {
                product.views.forEach(v => {
                    const viewKey = v.view_name.toLowerCase();
                    const viewObj = newViews.find(nv => nv.id === viewKey);
                    if (viewObj) {
                        viewObj.preview = getImageUrl(v.image_url);
                        // Check if it's a URL or internal path
                        if (v.image_url.startsWith('http')) {
                            viewObj.useUrl = true;
                            viewObj.urlInput = v.image_url;
                        }
                    }
                });
            } else {
                newViews[0].preview = getImageUrl(product.image_url);
                if (product.image_url.startsWith('http')) {
                    newViews[0].useUrl = true;
                    newViews[0].urlInput = product.image_url;
                }
            }
            setViews(newViews);
            setShowModal(true);

        } catch (error) {
            console.error("Failed to fetch product details for edit", error);
            toast.error("Failed to load product details");
        }
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setDeletedViews([]);
        setFormData({
            name: '',
            description: '',
            basePrice: '',
            categoryId: categories[0]?.id || '',
            imageUrl: '',
            isActive: true
        });
        setViews([
            { id: 'front', name: 'Front', file: null, preview: '' },
            { id: 'back', name: 'Back', file: null, preview: '' }
        ]);
        setShowModal(true);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await adminAPI.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };
    // Alias handleDelete to match usage
    const handleDelete = deleteProduct;

    // Product Export Logic
    const handleExportProducts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('http://localhost:5000/api/admin/products/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                toast.error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export products');
        }
    };

    const handleViewFileChange = (viewId, e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setViews(prev => prev.map(v => v.id === viewId ? { ...v, file, preview: previewUrl } : v));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const multipartForm = new FormData();
            multipartForm.append('name', formData.name);
            multipartForm.append('description', formData.description);
            multipartForm.append('basePrice', formData.basePrice);
            multipartForm.append('categoryId', formData.categoryId);
            multipartForm.append('slug', formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
            multipartForm.append('isActive', formData.isActive);

            // Append Views
            let hasFiles = false;
            views.forEach(view => {
                if (view.file) {
                    multipartForm.append(view.name, view.file);
                    hasFiles = true;
                } else if (view.useUrl && view.urlInput) {
                    // Send manual URL as a distinct field that backend can parse
                    multipartForm.append(`url_${view.name}`, view.urlInput);
                }
            });

            // Pass deleted/cleared views
            multipartForm.append('deletedViews', JSON.stringify(deletedViews));

            // Pass existing imageUrl if no new upload (handled by backend logic somewhat, but good to send)
            if (!hasFiles && editingProduct) {
                multipartForm.append('imageUrl', formData.imageUrl);
            }

            // For new products using URL, ensure we send a main image url hint
            if (!editingProduct && !hasFiles) {
                const frontView = views.find(v => v.id === 'front');
                if (frontView && frontView.useUrl && frontView.urlInput) {
                    multipartForm.append('imageUrl', frontView.urlInput);
                }
            }

            if (editingProduct) {
                await adminAPI.updateProduct(editingProduct.id, multipartForm);
                toast.success('Product updated successfully');
            } else {
                await adminAPI.addProduct(multipartForm);
                toast.success('Product created successfully');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Image URL Helper
    const getImageUrl = (url) => {
        if (!url) return 'https://placehold.co/300x300?text=No+Image';
        if (url.startsWith('http')) return url;
        return url;
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                    <p className="text-gray-400">Manage your product catalog</p>
                </div>
                <button
                    onClick={handleExportProducts}
                    className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-6 py-3 rounded-xl transition-all border border-green-500/20 mr-2"
                >
                    <Download size={20} />
                    <span>Export CSV</span>
                </button>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <Package size={48} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400 text-lg">No products found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 hover:border-primary/50 transition-all group shadow-lg flex flex-col">
                            <div className="aspect-square bg-[#0f172a] rounded-xl mb-4 overflow-hidden relative">
                                <img
                                    src={getImageUrl(product.image_url)}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Error'; }}
                                />
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                                {/* Debug Info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white p-1 truncate">
                                    {product.image_url || 'No URL'}
                                </div>
                            </div>

                            <div className="mb-4 flex-1">
                                <div className="text-xs text-primary font-medium mb-1 flex items-center gap-1">
                                    <Tag size={12} /> {product.category_name}
                                </div>
                                <h3 className="text-white font-bold text-lg leading-tight mb-2">{product.name}</h3>
                                <div className="text-2xl font-bold text-white flex items-center">
                                    <span className="text-base text-gray-400 mr-1">£</span>
                                    {parseFloat(product.base_price).toFixed(2)}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#1e293b] z-10">
                            <h2 className="text-xl font-bold text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                                        placeholder="e.g. Premium Cotton T-Shirt"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Base Price (£)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.basePrice}
                                            onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Multi-View Uploads */}
                                <div className="md:col-span-2 space-y-4">
                                    <label className="block text-sm font-medium text-gray-400">Product Views (Images)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {views.map(view => (
                                            <div key={view.id} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-xs uppercase text-gray-500 font-bold">{view.name} View</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setViews(prev => prev.map(v => v.id === view.id ? { ...v, useUrl: !v.useUrl, file: null, preview: '', urlInput: '' } : v))}
                                                        className="text-[10px] text-primary hover:underline cursor-pointer"
                                                    >
                                                        {view.useUrl ? 'Switch to Upload' : 'Switch to URL'}
                                                    </button>
                                                </div>

                                                {view.useUrl ? (
                                                    <input
                                                        type="text"
                                                        placeholder="https://example.com/image.png"
                                                        value={view.urlInput || ''}
                                                        onChange={(e) => {
                                                            const url = e.target.value;
                                                            setViews(prev => prev.map(v => v.id === view.id ? { ...v, urlInput: url, preview: url } : v));
                                                        }}
                                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none"
                                                    />
                                                ) : (
                                                    <div className="relative group">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleViewFileChange(view.id, e)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="bg-[#0f172a] border border-white/10 border-dashed rounded-xl h-32 flex flex-col items-center justify-center p-4 group-hover:border-primary transition-colors">
                                                            {view.preview ? (
                                                                <div className="relative w-full h-full">
                                                                    <img src={view.preview} className="w-full h-full object-contain" />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-20"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            if (editingProduct && !view.file && !view.useUrl) {
                                                                                // This was an existing image from DB
                                                                                setDeletedViews(prev => [...prev, view.name]);
                                                                            }
                                                                            setViews(prev => prev.map(v => v.id === view.id ? { ...v, file: null, preview: '', urlInput: '' } : v));
                                                                        }}
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon className="text-gray-500 mb-2" size={24} />
                                                                    <span className="text-xs text-gray-400">Click to Upload</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">Upload PNG/JPG images. 'Front' is required.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                    <textarea
                                        rows="4"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all resize-none"
                                        placeholder="Product details, material info, etc."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 bg-[#0f172a] border border-white/10 p-4 rounded-xl cursor-pointer hover:border-white/20 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent"
                                        />
                                        <span className="text-white font-medium">Active Product</span>
                                        <span className="text-gray-500 text-sm ml-auto">Visible in store</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;
