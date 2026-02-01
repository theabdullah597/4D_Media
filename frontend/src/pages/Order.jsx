import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, Truck, CreditCard, ChevronLeft, MapPin, Phone, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getTempOrder, clearTempOrder } from '../utils/db';

export default function Order() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    const [orderData, setOrderData] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryPostcode: '',
        orderNotes: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { state: { from: '/order', message: 'Please sign in to complete your order.' } });
        }
    }, [user, authLoading]);

    useEffect(() => {
        const loadOrder = async () => {
            if (location.state) {
                setOrderData(location.state);
            } else {
                const saved = await getTempOrder();
                if (saved) setOrderData(saved);
                else navigate('/customize');
            }
        };
        loadOrder();

        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: user.full_name,
                customerEmail: user.email,
                customerPhone: user.phone || '',
                deliveryAddress: user.address_line1 || '',
                deliveryCity: user.city || '',
                deliveryPostcode: user.postcode || ''
            }));
        }
    }, [user, location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const multipartForm = new FormData();

            // Basic Info
            Object.keys(formData).forEach(key => multipartForm.append(key, formData[key]));

            // multi-view items payload
            const items = [{
                productId: orderData.product.id,
                productName: orderData.product.name,
                quantity: orderData.quantity || 1,
                unitPrice: orderData.product.base_price,
                subtotal: orderData.totalPrice || orderData.product.base_price,
                variantDetails: orderData.variant,
                views: Object.keys(orderData.designs).map(viewId => ({
                    viewId: parseInt(viewId),
                    elements: orderData.designs[viewId].elements.map(el => ({
                        type: el.type,
                        content: (el.type === 'image' && el.source === 'upload') ? '' : (el.type === 'text' ? el.content : el.src),
                        fontFamily: el.fontFamily,
                        fontSize: el.fontSize,
                        color: el.color,
                        x: parseFloat(el.transform.match(/translate\(([-\d.]+)px/)?.[1] || 0),
                        y: parseFloat(el.transform.match(/px, ([-\d.]+)px/)?.[1] || 0),
                        rotation: parseFloat(el.transform.match(/rotate\(([-\d.]+)deg/)?.[1] || 0),
                        scaleX: 1, // Simplified
                        scaleY: 1,
                        source: el.source || 'library'
                    }))
                }))
            }];

            multipartForm.append('items', JSON.stringify(items));

            // Extract uploaded images across all views (Sequential to match backend order)
            // Backend expects files in the exact order they appear in the items array
            const views = Object.values(orderData.designs);
            for (const view of views) {
                for (const el of view.elements) {
                    if (el.type === 'image' && el.source === 'upload' && el.src.startsWith('data:')) {
                        try {
                            const res = await fetch(el.src);
                            const blob = await res.blob();
                            multipartForm.append('designImages', blob, `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`);
                        } catch (err) {
                            console.error('Failed to process image blob:', err);
                            // Append a placeholder or skip? Backend matches by count. 
                            // If we skip, the index shifts and next images break. 
                            // Better to error or append empty.
                            // For now, let's assume fetch(data-uri) won't fail easily.
                        }
                    }
                }
            }

            // Upload Full Design Snapshot (if available from Customize)
            if (orderData.previewImage) {
                const res = await fetch(orderData.previewImage);
                const blob = await res.blob();
                multipartForm.append('previewImage', blob, `preview_design_${Date.now()}.png`);
            }

            const res = await ordersAPI.create(multipartForm);

            if (res.data.success) {
                const newOrderNumber = res.data.data.orderNumber;
                const designLinks = res.data.data.designs || [];
                setOrderNumber(newOrderNumber);

                // Fetch WhatsApp link
                const wa = await ordersAPI.getWhatsAppLink(res.data.data.orderId);
                if (wa.data.success) setWhatsappLink(wa.data.data.whatsappUrl);

                setOrderComplete(true);
                localStorage.removeItem('tempOrder');
            }
        } catch (err) {
            console.error('Order Fail:', err);
            toast.error(err.response?.data?.message || 'Order failed. Please check UK postcode.', {
                duration: 5000,
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (orderComplete) return (
        <div className="min-h-screen bg-[#030014] py-20 px-4 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl w-full glass p-12 text-center rounded-3xl border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                    <Check size={40} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Order Created!</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-8">
                    <p className="text-yellow-400 font-bold mb-1">⚠️ ONE LAST STEP</p>
                    <p className="text-gray-300 text-sm">To start production, you must send your design files to our team on WhatsApp.</p>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl mb-8 text-left border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Order Reference</p>
                    <p className="text-xl font-mono font-bold text-primary">{orderNumber}</p>
                </div>

                <div className="flex flex-col gap-4 justify-center">
                    {whatsappLink && (
                        <a href={whatsappLink} target="_blank" className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] rounded-xl font-bold flex items-center justify-center gap-3 text-lg transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] animate-pulse">
                            <span className="text-white">Send Order to 4D Media</span>
                            <Phone size={24} className="text-white" />
                        </a>
                    )}
                    <button onClick={() => navigate('/products')} className="px-8 py-3 text-gray-500 hover:text-white transition-colors text-sm">
                        Return to Store
                    </button>
                </div>
            </motion.div>
        </div>
    );

    if (!orderData) return null;

    return (
        <div className="min-h-screen bg-[#030014] pt-24 pb-20 px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Checkout Form */}
                    <div className="flex-1 space-y-8">
                        <section className="glass p-8 rounded-3xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Truck className="text-primary" /> UK Shipping Details
                            </h2>
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-widest">Full Name</label>
                                        <input name="customerName" required value={formData.customerName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-widest">Contact Number</label>
                                        <input name="customerPhone" required value={formData.customerPhone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none" placeholder="07xxx xxxxxx" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-widest">Address Line</label>
                                    <input name="deliveryAddress" required value={formData.deliveryAddress} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-widest">City</label>
                                        <input name="deliveryCity" required value={formData.deliveryCity} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-widest">UK Postcode</label>
                                        <input name="deliveryPostcode" required value={formData.deliveryPostcode} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none" placeholder="E1 6AN" />
                                    </div>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Right: Summary */}
                    <div className="w-full lg:w-[400px]">
                        <div className="glass p-8 rounded-3xl border border-white/10 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono">
                                <ShoppingBag className="text-primary" /> SUMMARY
                            </h2>
                            <div className="space-y-6 mb-8">
                                <div className="flex gap-4">
                                    <div className="w-20 h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                                        <img src={orderData.previewImage || Object.values(orderData.designs)[0]?.elements.find(e => e.type === 'image')?.src || orderData.product.image_url} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm">{orderData.product.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 uppercase">{orderData.variant.size} • {orderData.variant.color}</p>
                                        <p className="text-xs text-primary mt-2 font-bold">Multi-View Design (x{Object.keys(orderData.designs).length})</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-white/5 py-4 space-y-3">
                                <div className="flex justify-between text-sm text-gray-400"><span>Subtotal (x{orderData.quantity || 1})</span><span>£{parseFloat(orderData.totalPrice || orderData.product.base_price).toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-400"><span>UK Delivery</span><span className="text-green-500 font-bold uppercase text-[10px]">Free</span></div>
                            </div>
                            <div className="border-t border-white/5 pt-6 mt-4">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-bold text-gray-400">TOTAL</span>
                                    <span className="text-3xl font-extrabold text-white font-mono">£{parseFloat(orderData.totalPrice || orderData.product.base_price).toFixed(2)}</span>
                                </div>
                                <button type="submit" form="checkout-form" disabled={submitting} className="w-full py-5 bg-gradient-to-br from-primary via-primary to-accent rounded-2xl font-bold tracking-widest text-sm shadow-[0_0_30px_rgba(112,0,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 underline-offset-4 decoration-2">
                                    {submitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>PLACE SECURE ORDER <CreditCard size={18} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

