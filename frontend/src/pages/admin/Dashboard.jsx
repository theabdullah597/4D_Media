import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { Package, ShoppingBag, DollarSign, Clock, ArrowRight, TrendingUp, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import ChangePasswordModal from '../../components/ChangePasswordModal';

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes, revenueRes, productsRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getOrders({ limit: 5 }),
                adminAPI.getRevenueAnalytics(),
                adminAPI.getProductAnalytics()
            ]);

            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data);
            setRevenueData(revenueRes.data.data);
            setProductData(productsRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#7000FF', '#00D1FF', '#FFBD00', '#FF005C', '#00FF94'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Overview of your store's performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-all text-gray-300 hover:text-white"
                    >
                        <KeyRound size={16} />
                        Change Password
                    </button>
                    <div className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                isAdmin={true}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Package className="text-blue-400" />}
                    label="Total Orders"
                    value={stats?.totalOrders || 0}
                    color="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard
                    icon={<Clock className="text-yellow-400" />}
                    label="Pending"
                    value={stats?.pendingOrders || 0}
                    color="bg-yellow-500/10 border-yellow-500/20"
                />
                <StatCard
                    icon={<ShoppingBag className="text-green-400" />}
                    label="Completed"
                    value={stats?.completedOrders || 0}
                    color="bg-green-500/10 border-green-500/20"
                />
                <StatCard
                    icon={<DollarSign className="text-purple-400" />}
                    label="Revenue"
                    value={`£${(stats?.totalRevenue || 0).toFixed(2)}`}
                    color="bg-purple-500/10 border-purple-500/20"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Revenue Trends
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7000FF" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#7000FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" fontSize={10} tick={{ fill: '#94a3b8' }} tickMargin={10} />
                                <YAxis fontSize={10} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `£${v}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    formatter={(v) => [`£${v}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#7000FF" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-accent" />
                        Top Products
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" fontSize={10} tick={{ fill: '#94a3b8' }} />
                                <YAxis dataKey="product_name" type="category" width={100} fontSize={10} tick={{ fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                <Bar dataKey="quantity" fill="#7000FF" radius={[0, 4, 4, 0]}>
                                    {productData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No orders received yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="pb-4 pl-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                                    <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="pb-4 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-4">
                                            <span className="font-mono text-primary font-medium">{order.order_number}</span>
                                        </td>
                                        <td className="py-4 text-gray-300">{order.customer_name}</td>
                                        <td className="py-4 font-medium text-white">£{parseFloat(order.total_amount).toFixed(2)}</td>
                                        <td className="py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="py-4 pr-4 text-right">
                                            <Link to="/admin/orders" className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all">Details</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-[#1e293b]/80 backdrop-blur-lg border rounded-2xl p-6 ${color}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white/5">
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide font-medium">{label}</div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        working: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    const labels = {
        completed: 'Completed',
        pending: 'New Order',
        in_progress: 'Processing',
        cancelled: 'Cancelled'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}

export default Dashboard;
