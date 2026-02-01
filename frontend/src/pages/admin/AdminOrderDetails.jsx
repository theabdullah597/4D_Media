import React from 'react';
import { Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

const safeJsonParse = (str) => {
    try {
        const result = JSON.parse(str || '{}');
        return result || {};
    } catch (e) {
        console.warn('Invalid JSON in OrderDetails:', e);
        return {};
    }
};

const getImageUrl = (path) => {
    if (!path) return '';

    // 1. Handle base64
    if (path.startsWith('data:')) return path;

    // 2. Handle existing HTTP URLs
    if (path.startsWith('http')) {
        try {
            const url = new URL(path);
            // If it's a local upload (localhost:5173 or similar) pointing to /uploads
            if (url.pathname.startsWith('/uploads')) {
                // Strip domain, we will rebuild it
                path = url.pathname;
            } else {
                // External URL or valid absolute URL we don't want to touch
                return path;
            }
        } catch (e) {
            return path;
        }
    }

    // 3. Construct absolute Backend URL
    const baseUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5000';

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Final check to avoid double slashes if baseUrl ends with /
    const finalBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${finalBase}${cleanPath}`;
};

const AdminOrderDetails = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1e293b] border-l border-white/10 shadow-2xl p-6 overflow-y-auto z-50"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Status */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <label className="text-xs text-gray-500 uppercase font-medium">Status</label>
                    <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg mt-2 px-3 py-2 text-white outline-none focus:border-primary"
                    >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Customer Info */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Customer Info</h3>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Name</span>
                            <span className="text-white text-right">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white text-right text-xs sm:text-sm break-all">{order.customer_email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Phone</span>
                            <span className="text-white text-right">{order.customer_phone}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Delivery Address</h3>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-gray-300 text-sm leading-relaxed">
                        {order.delivery_address || 'N/A'}<br />
                        {order.delivery_city || ''}, {order.delivery_postal_code || order.delivery_postcode || ''}
                    </div>
                </div>

                {/* Order Items */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item, idx) => {
                            const variantDetails = safeJsonParse(item.variant_details_json);
                            const designElementCount = item.designElements?.length || 0;

                            return (
                                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    {/* Custom Preview Image (Mockup) */}
                                    {variantDetails.custom_preview && (
                                        <div className="mb-3 border border-white/10 rounded-lg overflow-hidden bg-black/20 p-2">
                                            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
                                                <div className="text-[10px] text-primary font-bold uppercase">Mockup Preview</div>
                                                <a
                                                    href={variantDetails.custom_preview}
                                                    download={`mockup-${order.order_number}-${idx + 1}.png`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors flex items-center gap-1"
                                                >
                                                    <Download size={10} /> Save
                                                </a>
                                            </div>
                                            <img
                                                src={variantDetails.custom_preview}
                                                className="w-full h-auto object-contain rounded"
                                                alt="Mockup"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-white">{item.product_name}</div>
                                            <div className="text-xs text-gray-400">Qty: {item.quantity} • {item.variant_details_json ? (JSON.parse(item.variant_details_json || '{}').size || 'Standard') : 'Standard'}</div>
                                        </div>
                                        <div className="font-bold text-white">£{parseFloat(item.subtotal || 0).toFixed(2)}</div>
                                    </div>

                                    {/* Print Files / Assets */}
                                    {designElementCount > 0 ? (
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <div className="text-[10px] text-primary font-bold uppercase mb-2 flex justify-between">
                                                <span>Print Assets</span>
                                                <span className="text-gray-500">{designElementCount} files</span>
                                            </div>

                                            <div className="space-y-2">
                                                {/* Images */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {item.designElements.filter(el => el.element_type === 'image').map((el, i) => (
                                                        <a
                                                            key={`img-${i}`}
                                                            href={getImageUrl(el.content)}
                                                            download={`asset-${order.order_number}-${i + 1}.png`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block bg-[#0f172a] p-2 rounded border border-white/10 hover:border-primary text-xs text-center text-gray-300 hover:text-white transition-colors group relative"
                                                        >
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <Download size={12} />
                                                                <span className="truncate max-w-[80px] font-bold">{el.view_name || `Asset ${i + 1}`}</span>
                                                            </div>
                                                            <div className="h-10 w-full flex items-center justify-center bg-black/20 rounded">
                                                                <img src={getImageUrl(el.content)} className="max-h-full max-w-full object-contain" alt="Asset" onError={(e) => e.target.style.display = 'none'} />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>

                                                {/* Text Elements */}
                                                {item.designElements.filter(el => el.element_type === 'text').map((el, i) => (
                                                    <div key={`txt-${i}`} className="bg-white/5 p-2 rounded border border-white/5 text-xs text-gray-300 flex justify-between items-center">
                                                        <span className="truncate max-w-[150px]" title={el.content}>Ag "<b>{el.content}</b>"</span>
                                                        <span className="text-[10px] text-gray-500">{el.font_family}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-[10px] text-yellow-500/50 italic border border-yellow-500/10 p-2 rounded bg-yellow-500/5">
                                            No separate print assets. Use Mockup.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Total */}
                <div className="pt-6 border-t border-white/10 pb-20">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Amount</span>
                        <span className="text-2xl font-bold text-white">£{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminOrderDetails;
