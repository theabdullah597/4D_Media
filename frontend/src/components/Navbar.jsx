import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, User, LogOut, Menu, X, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import ChangePasswordModal from './ChangePasswordModal';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    // Hide navbar on admin login page
    if (location.pathname.toLowerCase() === '/admin/login') return null;

    const isAdmin = location.pathname.toLowerCase().startsWith('/admin');
    const adminToken = localStorage.getItem('adminToken');

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        if (isAdmin) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        } else {
            logout();
        }
    };

    const navLinks = isAdmin ? [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: ShoppingBag },
        { path: '/admin/orders', label: 'Orders', icon: User },
    ] : [
        { path: '/', label: 'Home' },
        { path: '/products', label: 'Products' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-[#030014]/80 backdrop-blur-md border-b border-white/10 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-300" />
                            <img src={logo} alt="4D Media" className="h-10 w-auto relative z-10 drop-shadow-[0_0_10px_rgba(112,0,255,0.5)]" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:text-white transition-colors">
                            4D Media
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(112,0,255,0.5)] ${location.pathname === link.path ? 'text-primary' : 'text-gray-300'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {link.icon && <link.icon size={16} />}
                                    {link.label}
                                </span>
                            </Link>
                        ))}

                        <div className="h-6 w-[1px] bg-white/10" />


                        {/* User Navigation (Only show if NOT admin and user is logged in) */}
                        {!isAdmin && user && (
                            <div className="flex items-center gap-4">
                                <Link to="/customize">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent rounded-full text-white text-sm font-semibold shadow-[0_0_20px_rgba(112,0,255,0.3)] hover:shadow-[0_0_30px_rgba(112,0,255,0.5)] transition-all border border-white/10"
                                    >
                                        Create Design
                                    </motion.button>
                                </Link>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    <KeyRound size={16} />
                                    Password
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                    title={`Signed in as ${user.full_name}`}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}

                        {/* Guest Navigation (Only show if NOT admin and NOT logged in) */}
                        {!isAdmin && !user && (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
                                <Link to="/register">
                                    <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-all">
                                        Register
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Admin Navigation (Only show if Admin) */}
                        {isAdmin && (
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20 uppercase tracking-widest">
                                    Admin Mode
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#030014]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors ${location.pathname === link.path ? 'text-primary bg-primary/10' : 'text-gray-300'
                                        }`}
                                >
                                    {link.icon && <link.icon size={20} />}
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile User Actions */}
                            {!isAdmin && user && (
                                <>
                                    <Link to="/customize" className="mt-2" onClick={() => setIsMenuOpen(false)}>
                                        <button className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold shadow-lg">
                                            Create New Design
                                        </button>
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsPasswordModalOpen(true);
                                        }}
                                        className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition-colors w-full text-left"
                                    >
                                        <KeyRound size={20} />
                                        Change Password
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition-colors w-full text-left"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </>
                            )}

                            {/* Mobile Guest Actions */}
                            {!isAdmin && !user && (
                                <div className="flex flex-col gap-2 mt-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full py-3 text-center rounded-xl text-white font-semibold hover:bg-white/5 transition-colors border border-white/10"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full py-3 bg-white/10 text-center rounded-xl text-white font-semibold hover:bg-white/20 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                isAdmin={isAdmin}
            />
        </motion.nav >
    );
}

export default Navbar;
