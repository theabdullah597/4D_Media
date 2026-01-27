import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import { Search, Filter, Download, Eye, ChevronDown, Package, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import AdminOrderDetails from './AdminOrderDetails';

import toast from 'react-hot-toast';

function AdminOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchOrders();
    }, [navigate, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const filters = statusFilter ? { status: statusFilter } : {};
            const response = await adminAPI.getOrders(filters);
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this order? This action cannot be undone and will remove it from the database.')) {
            return;
        }

        try {
            await adminAPI.deleteOrder(orderId);
            setOrders(orders.filter(o => o.id !== orderId));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(null);
            }
            toast.success('Order deleted successfully');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(error.response?.data?.message || 'Failed to delete order');
        }
    };

    const handleExport = async () => {
        try {
            const filters = statusFilter ? { status: statusFilter } : {};
            const response = await adminAPI.exportOrders(filters);

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error exporting orders:', error);
            const errMsg = error.response?.data?.message || error.message;
            toast.error('Failed to export orders: ' + errMsg);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
                    <p className="text-gray-400">Manage customer orders and processing</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-6 py-3 rounded-xl transition-all"
                >
                    <Download size={20} />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['', 'pending', 'in_progress', 'completed', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {status ? status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'All Orders'}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 relative">
                {/* Orders List */}
                <div className={`flex-1 transition-all duration-300 ${selectedOrder ? 'mr-[400px]' : ''}`}>
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-white/5 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Name or Email"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <Package size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No orders found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#0f172a]/50 text-xs text-gray-400 uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-4 text-left whitespace-nowrap">Order #</th>
                                            <th className="px-6 py-4 text-left whitespace-nowrap">Customer</th>
                                            <th className="px-6 py-4 text-left whitespace-nowrap">Items</th>
                                            <th className="px-6 py-4 text-left whitespace-nowrap">Total</th>
                                            <th className="px-6 py-4 text-left whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 text-right whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-primary whitespace-nowrap">{order.order_number}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-medium whitespace-nowrap">{order.customer_name}</div>
                                                    <div className="text-xs text-gray-500 whitespace-nowrap">{order.customer_email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{order.items?.length || 0}</td>
                                                <td className="px-6 py-4 font-bold text-white whitespace-nowrap">£{parseFloat(order.total_amount).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        order.status === 'pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            order.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                        {order.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2 whitespace-nowrap">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                                                        className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-gray-400"
                                                        title="Delete Order Permanently"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors text-gray-400"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Sidebar */}
                <AnimatePresence>
                    {selectedOrder && (
                        <AdminOrderDetails
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                            onUpdateStatus={handleStatusUpdate}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AdminOrders;
