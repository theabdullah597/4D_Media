import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Moveable from 'react-moveable';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

import { productsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { saveTempOrder } from '../utils/db';
// Note: useEditorHistory might need adjustment for multi-view, 
// for simplicity in this refactor we'll focus on the core multi-view logic.
import Toolbar from '../components/editor/Toolbar';

import PropertiesPanel from '../components/editor/PropertiesPanel';
import AssetsPanel from '../components/editor/AssetsPanel';
import { ChevronLeft, Maximize, ZoomIn, ZoomOut } from 'lucide-react';

export default function Customize() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // Get loading state

    // -- Authentication Check --
    useEffect(() => {
        // Wait for auth to initialize before checking user
        if (!authLoading && !user) {
            // Redirect to login, preserving where they wanted to go
            navigate('/login', { state: { from: `/customize/${productId || ''}` } });
        }
    }, [user, authLoading, navigate, productId]);

    // -- Product & View State --
    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeViewId, setActiveViewId] = useState(null); // ID from database

    // -- Design State (Stored per view) --
    // Structure: { [viewId]: { elements: [], history: [] } }
    const [designs, setDesigns] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [zoom, setZoom] = useState(1);

    // -- Global State --
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activePanel, setActivePanel] = useState(null); // 'assets', 'settings', etc.
    const [lastAction, setLastAction] = useState('Ready');

    const designAreaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Get current view's elements
    const currentElements = activeViewId && designs[activeViewId] ? designs[activeViewId].elements : [];

    useEffect(() => {
        if (productId) {
            fetchProduct(productId);
        } else {
            navigate('/products');
        }
    }, [productId]);

    // -- Active View Resolution (Moved up to satisfy Rules of Hooks) --
    const activeView = product?.views?.find(v => v.id === activeViewId) || product?.views?.[0];

    // Sync activeViewId if needed
    useEffect(() => {
        if (activeView && activeView.id !== activeViewId) {
            setActiveViewId(activeView.id);
        }
    }, [activeView, activeViewId]);

    const fetchProduct = async (id) => {
        setLoading(true);
        try {
            const response = await productsAPI.getById(id);
            const data = response.data.data;
            setProduct(data);

            // Default variants
            setSelectedSize(data.sizes?.[0]?.variant_value || 'Adults M');
            setSelectedColor(data.colors?.[0]?.variant_value || 'White');

            // Ensure at least one view exists
            let views = data.views;
            if (!views || !Array.isArray(views) || views.length === 0) {
                console.warn('Product has no views. Creating default.');
                views = [{
                    id: 'temp_default',
                    view_name: 'Front',
                    image_url: data.image_url || '/assets/placeholder-product.png',
                    is_default: 1,
                    print_area_json: '{"x": 150, "y": 150, "width": 200, "height": 300}'
                }];
                data.views = views;
            }

            // Initialize designs for each view
            const initialDesigns = {};
            views.forEach(view => {
                initialDesigns[view.id] = { elements: [] };
            });
            setDesigns(initialDesigns);

            // Default view selection
            const defaultView = views.find(v => v.is_default) || views[0];
            if (defaultView) setActiveViewId(defaultView.id);

        } catch (error) {
            console.error('Error fetching product:', error);
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    // Auto-scale for mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                // Scale to fit width (assuming 500px base width + margins)
                const scale = (window.innerWidth - 40) / 550;
                setZoom(Math.min(0.8, Math.max(0.3, scale)));
            } else {
                setZoom(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // -- Element Actions --
    const updateCurrentViewElements = (newElements) => {
        setDesigns(prev => ({
            ...prev,
            [activeViewId]: { ...prev[activeViewId], elements: newElements }
        }));
    };

    const addText = () => {
        const id = Date.now();
        const newElement = {
            id, type: 'text', content: 'Double Click to Edit',
            fontFamily: 'Inter', fontSize: 24, color: '#FFFFFF',
            fontWeight: '600', fontStyle: 'normal', textAlign: 'center',
            letterSpacing: 0, lineHeight: 1.2, textTransform: 'none',
            outlineWidth: 0, outlineColor: '#000000',
            shadowBlur: 0, shadowColor: '#000000', shadowOffsetX: 2, shadowOffsetY: 2,
            width: 250, height: 40,
            transform: 'translate(125px, 200px) rotate(0deg) scale(1, 1)',
            locked: false, hidden: false
        };
        updateCurrentViewElements([...currentElements, newElement]);
        setSelectedId(id);
    };

    const addShape = (shapeType) => {
        const id = Date.now();
        const newElement = {
            id, type: 'shape', shapeType,
            width: 100, height: 100,
            backgroundColor: '#000000',
            transform: 'translate(200px, 200px) rotate(0deg) scale(1, 1)',
            locked: false, hidden: false
        };
        updateCurrentViewElements([...currentElements, newElement]);
        setSelectedId(id);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const id = Date.now();
                const maxSize = 200;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                const newElement = {
                    id, type: 'image', src: event.target.result,
                    width: img.width * scale, height: img.height * scale,
                    transform: 'translate(150px, 150px) rotate(0deg) scale(1, 1)',
                    opacity: 1, locked: false, hidden: false,
                    source: 'upload'
                };
                updateCurrentViewElements([...currentElements, newElement]);
                setSelectedId(id);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleDoubleClick = (el, e) => {
        e.stopPropagation();
        if (el.type === 'text') {
            const newText = prompt("Edit text:", el.content);
            if (newText !== null) {
                const updated = currentElements.map(item =>
                    item.id === el.id ? { ...item, content: newText } : item
                );
                updateCurrentViewElements(updated);
            }
        }
    };

    const handleAddAsset = (asset, type) => {
        const id = Date.now();
        const maxSize = 200;

        if (type === 'shape') {
            // Handle generic path shapes from library
            const newElement = {
                id,
                type: 'shape',
                shapeType: 'path',
                path: asset.path,
                viewBox: asset.viewBox,
                backgroundColor: asset.fill || '#FFFFFF',
                width: 100, height: 100,
                transform: 'translate(200px, 200px) rotate(0deg) scale(1, 1)',
                locked: false, hidden: false
            };
            updateCurrentViewElements([...currentElements, newElement]);
        } else {
            // Handle images and patterns
            const newElement = {
                id,
                type: 'image', // Patterns also treated as images for now
                src: asset,
                width: maxSize, height: maxSize,
                transform: 'translate(150px, 150px) rotate(0deg) scale(1, 1)',
                opacity: 1, locked: false, hidden: false,
                source: 'library'
            };
            updateCurrentViewElements([...currentElements, newElement]);
        }
        setSelectedId(id);
        setActivePanel(null); // Close panel after selection
    };

    const handleUpdateElement = (updatedProps) => {
        const keys = Object.keys(updatedProps).join(', ');
        setLastAction(`Updated: ${keys} at ${new Date().toLocaleTimeString()}`);

        const newElements = currentElements.map(el =>
            el.id === selectedId ? { ...el, ...updatedProps } : el
        );
        updateCurrentViewElements(newElements);
    };

    const handleDeleteElement = (id) => {
        updateCurrentViewElements(currentElements.filter(e => e.id !== id));
        setSelectedId(null);
    };

    // -- Price Calculation --
    const getPriceDetails = () => {
        if (!product) return { unitPrice: 0, total: 0, discountPercent: 0, nextTier: null };

        let unitPrice = parseFloat(product.base_price);

        // Add Variant Modifiers
        const sizeVariant = product.sizes?.find(s => s.variant_value === selectedSize);
        if (sizeVariant) unitPrice += parseFloat(sizeVariant.price_modifier || 0);

        const colorVariant = product.colors?.find(c => c.variant_value === selectedColor);
        if (colorVariant) unitPrice += parseFloat(colorVariant.price_modifier || 0);

        const activeTier = product.price_tiers?.find(t =>
            quantity >= t.min_quantity && (t.max_quantity === null || quantity <= t.max_quantity)
        );

        const discountPercent = activeTier ? parseFloat(activeTier.discount_percent) : 0;
        const discountedUnitPrice = unitPrice * (1 - discountPercent / 100);
        const nextTier = product.price_tiers?.find(t => t.min_quantity > quantity);

        return {
            originalUnitPrice: unitPrice,
            unitPrice: discountedUnitPrice,
            total: discountedUnitPrice * quantity,
            discountPercent,
            savings: (unitPrice - discountedUnitPrice) * quantity,
            nextTier
        };
    };

    const priceDetails = getPriceDetails();

    // -- Save & Proceed --
    const handleOrder = async () => {
        setExporting(true);
        try {
            let previewImage = null;
            if (designAreaRef.current) {
                const canvas = await html2canvas(designAreaRef.current, {
                    useCORS: true,
                    backgroundColor: null, // Transparent background
                    scale: 2 // High resolution
                });
                previewImage = canvas.toDataURL('image/png');
            }

            const orderPayload = {
                product,
                variant: { size: selectedSize, color: selectedColor },
                designs,
                totalPrice: priceDetails.total,
                quantity,
                unitPrice: priceDetails.originalUnitPrice,
                previewImage
            };

            try {
                await saveTempOrder(orderPayload);
                navigate('/order');
            } catch (error) {
                console.error('Storage failed:', error);
                toast.error('Your design is too large to save. Please try reducing the number of images.', {
                    duration: 5000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                });
            }
        } finally {
            setExporting(false);
        }
    };

    if (loading || authLoading) return (
        <div className="h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 animate-pulse">Initializing Studio...</p>
            </div>
        </div>
    );

    if (!product) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Loading Product...</h2>
                    <button onClick={() => window.location.reload()} className="text-primary hover:underline">Refresh Page</button>
                </div>
            </div>
        );
    }

    // Helper for safe JSON parsing
    const getPrintArea = (jsonStr) => {
        try {
            return JSON.parse(jsonStr || '{}');
        } catch (e) {
            console.error("Invalid Print Area JSON:", e);
            return { x: '20%', y: '20%', width: '60%', height: '60%' };
        }
    };


    return (
        <div className="min-h-screen lg:h-screen bg-[#0f172a] text-white flex flex-col overflow-x-hidden lg:overflow-hidden">
            {/* Top Bar */}
            <div className="h-auto min-h-[3.5rem] bg-[#1e293b]/80 backdrop-blur-md border-b border-white/10 flex flex-wrap gap-2 items-center px-4 justify-between z-50 py-2">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/products')} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400">
                        <ChevronLeft size={20} />
                    </button>

                    {/* View Switcher Tabs */}
                    <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
                        {product.views.map(view => (
                            <button
                                key={view.id}
                                onClick={() => { setActiveViewId(view.id); setSelectedId(null); }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeViewId === view.id ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {view.view_name}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">£{priceDetails.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button onClick={handleOrder} className="px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-lg text-xs font-bold transition-all hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] whitespace-nowrap">
                        <span className="hidden sm:inline">Proceed to Checkout</span>
                        <span className="sm:hidden">Checkout</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                <Toolbar
                    onAddText={addText}
                    onUploadImage={() => fileInputRef.current.click()}
                    onAddShape={addShape}
                    onOpenLibrary={() => setActivePanel(activePanel === 'assets' ? null : 'assets')}
                    activeTool={activePanel}
                />

                {activePanel === 'assets' && (
                    <AssetsPanel
                        onClose={() => setActivePanel(null)}
                        onSelectAsset={handleAddAsset}
                    />
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

                {/* Canvas */}
                <div className="flex-1 bg-[#0b0f19] relative overflow-hidden flex flex-col items-center justify-center p-4 lg:p-10 min-h-[50vh] lg:min-h-0">
                    <div className="absolute top-6 flex items-center gap-4 bg-[#1e293b]/50 backdrop-blur border border-white/10 px-4 py-2 rounded-full z-40">
                        <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}><ZoomOut size={14} /></button>
                        <span className="text-[10px] font-mono min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}><ZoomIn size={14} /></button>
                    </div>

                    <div
                        className="relative transition-all duration-300"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                    >
                        {activeView && (
                            <div
                                ref={designAreaRef}
                                className="relative bg-white/5 rounded-lg shadow-2xl overflow-hidden border border-white/5"
                                style={{ width: '500px', height: '600px' }}
                                onClick={() => setSelectedId(null)}
                            >
                                {/* Product Mockup */}
                                <img
                                    src={activeView.image_url}
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
                                    alt={activeView.view_name}
                                    crossOrigin="anonymous"
                                />

                                {/* Print Area (JSON defined) */}
                                {(() => {
                                    const area = getPrintArea(activeView.print_area_json);
                                    return (
                                        <div
                                            className="absolute border border-dashed border-primary/30 z-10"
                                            style={{
                                                left: area.x || '20%', top: area.y || '20%',
                                                width: area.width || '60%', height: area.height || '60%'
                                            }}
                                        >
                                            {/* Element Renderer */}
                                            {currentElements.map(el => (
                                                <div
                                                    key={el.id}
                                                    data-id={el.id}
                                                    className={`absolute cursor-move ${selectedId === el.id ? 'z-50' : 'z-20'}`}
                                                    style={{
                                                        width: el.width, height: el.height, transform: el.transform,
                                                        opacity: el.hidden ? 0 : 1, pointerEvents: el.locked ? 'none' : 'auto'
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                                                    onDoubleClick={(e) => handleDoubleClick(el, e)}
                                                >
                                                    {el.type === 'text' ? (
                                                        <p style={{
                                                            fontFamily: el.fontFamily, fontSize: el.fontSize, color: el.color,
                                                            fontWeight: el.fontWeight, textAlign: el.textAlign,
                                                            letterSpacing: (el.letterSpacing || 0) + 'px',
                                                            lineHeight: el.lineHeight || 1.2,
                                                            textTransform: el.textTransform || 'none',
                                                            WebkitTextStroke: el.outlineWidth > 0 ? `${el.outlineWidth}px ${el.outlineColor}` : 'none',
                                                            textShadow: el.shadowBlur > 0 || el.shadowOffsetX > 0 ? `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || 'transparent'}` : 'none',
                                                            width: '100%', height: '100%',
                                                            display: 'flex', alignItems: 'center', justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start'
                                                        }}>
                                                            {el.content}
                                                        </p>
                                                    ) : el.type === 'shape' ? (
                                                        <div style={{ width: '100%', height: '100%' }}>
                                                            <svg width="100%" height="100%" viewBox={el.viewBox || "0 0 100 100"} preserveAspectRatio="none">
                                                                {el.shapeType === 'rect' && (
                                                                    <rect x="0" y="0" width="100" height="100" fill={el.backgroundColor || el.fill} />
                                                                )}
                                                                {el.shapeType === 'circle' && (
                                                                    <circle cx="50" cy="50" r="50" fill={el.backgroundColor || el.fill} />
                                                                )}
                                                                {el.shapeType === 'triangle' && (
                                                                    <polygon points="50,0 100,100 0,100" fill={el.backgroundColor || el.fill} />
                                                                )}
                                                                {el.shapeType === 'path' && (
                                                                    <path d={el.path} fill={el.backgroundColor || el.fill} />
                                                                )}
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <img src={el.src} className="w-full h-full object-contain" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <Moveable
                            target={selectedId ? `[data-id="${selectedId}"]` : null}
                            draggable={true}
                            resizable={true}
                            rotatable={true}
                            onDrag={({ target, transform }) => { target.style.transform = transform; }}
                            onDragEnd={({ target }) => {
                                handleUpdateElement({ transform: target.style.transform });
                            }}
                            onResize={({ target, width, height, drag }) => {
                                target.style.width = `${width}px`;
                                target.style.height = `${height}px`;
                                target.style.transform = drag.transform;
                            }}
                            onResizeEnd={({ target }) => {
                                handleUpdateElement({
                                    width: parseFloat(target.style.width),
                                    height: parseFloat(target.style.height),
                                    transform: target.style.transform
                                });
                            }}
                            onRotate={({ target, drag }) => { target.style.transform = drag.transform; }}
                            onRotateEnd={({ target }) => {
                                handleUpdateElement({ transform: target.style.transform });
                            }}
                            renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                            zoom={zoom}
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 bg-[#1e293b] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col p-6 gap-6 z-20 overflow-y-auto lg:overflow-hidden flex-shrink-0 lg:h-full">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Quantity & Pricing</h3>
                        <div className="space-y-4">
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-gray-400 block mb-3">Units to Print</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    >-</button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="flex-1 bg-transparent border-b border-white/20 text-center font-bold text-lg focus:outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    >+</button>
                                </div>
                            </div>

                            {priceDetails.nextTier && (
                                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                                    <p className="text-[10px] text-primary-light font-bold flex items-center gap-2">
                                        <Maximize size={12} />
                                        BULK INCENTIVE
                                    </p>
                                    <p className="text-xs mt-1 text-gray-300">
                                        Add <span className="text-white font-bold">{priceDetails.nextTier.min_quantity - quantity}</span> more to unlock <span className="text-green-400 font-bold">{priceDetails.nextTier.discount_percent}% off</span>
                                    </p>
                                </div>
                            )}

                            {/* Size Selection */}
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 mt-4">Size Selection</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes?.filter(s => ['S', 'M', 'L', 'Small', 'Medium', 'Large'].includes(s.variant_value)).map(s => {
                                        const isSelected = selectedSize === s.variant_value;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedSize(s.variant_value)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}`}
                                            >
                                                {s.variant_value}
                                                {parseFloat(s.price_modifier) > 0 && <span className="ml-1 opacity-70">+£{parseFloat(s.price_modifier).toFixed(2)}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner min-h-[200px]">
                        <PropertiesPanel
                            element={currentElements.find(el => el.id === selectedId)}
                            onChange={handleUpdateElement}
                            onDelete={() => handleDeleteElement(selectedId)}
                        />
                        <div className="text-[10px] text-gray-500 text-center mt-2 border-t border-white/10 pt-2">
                            Status: {lastAction}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}
