import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, Box, ShoppingBag, Truck, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setFeaturedProducts(response.data.data.slice(0, 4));
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-[#020010]/80" />

                {/* Modern Grid Pattern Overlay */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>

                {/* Animated Orbs for Pop */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse mix-blend-screen" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[128px] animate-pulse delay-1000 mix-blend-screen" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-accent text-sm font-medium mb-6">
                            ✨ The Future of Custom Printing
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                            Design Your <br />
                            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                Imagination
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Create stunning custom merchandise with our 3D design tools.
                            Premium quality prints, delivered globally.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/customize">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-bold text-lg shadow-[0_0_30px_rgba(112,0,255,0.4)] hover:shadow-[0_0_50px_rgba(112,0,255,0.6)] transition-all flex items-center gap-2"
                                >
                                    <Palette size={20} />
                                    Start Designing
                                </motion.button>
                            </Link>
                            <Link to="/products">
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-lg hover:border-white/20 transition-all flex items-center gap-2"
                                >
                                    <ShoppingBag size={20} />
                                    Browse Products
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Floating 3D Elements Placeholder for visual interest */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-tr from-primary to-purple-500 rounded-full blur-[80px] opacity-30" />
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Shop by Category</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Find the perfect base for your next masterpiece.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'T-Shirts', query: 'shirt', color: 'from-blue-500/20 to-cyan-500/20', icon: '👕' },
                            { name: 'Hoodies', query: 'hoodie', color: 'from-purple-500/20 to-pink-500/20', icon: '🧥' },
                            { name: 'Mugs', query: 'mug', color: 'from-orange-500/20 to-red-500/20', icon: '☕' },
                            { name: 'Caps', query: 'cap', color: 'from-green-500/20 to-emerald-500/20', icon: '🧢' }
                        ].map((cat, idx) => (
                            <Link key={idx} to={`/products?search=${cat.query}`} className="group relative overflow-hidden rounded-3xl bg-[#1e293b] aspect-[4/5] border border-white/5 hover:border-primary/50 transition-all duration-500">
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                    <span className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">{cat.icon}</span>
                                    <h3 className="text-2xl font-bold text-white group-hover:translate-y-[-5px] transition-transform duration-300">{cat.name}</h3>
                                    <span className="mt-4 text-xs font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1">
                                        Explore <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works (Process) */}
            <section className="py-24 bg-white/[0.02]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-primary text-sm font-bold uppercase tracking-widest">Simple Process</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">How It Works</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent border-t border-dashed border-white/20"></div>

                        {[
                            { title: '1. Pick a Product', desc: 'Choose from our high-quality inventory.', icon: ShoppingBag },
                            { title: '2. Customize It', desc: 'Add text, images, and shapes in our 3D editor.', icon: Palette },
                            { title: '3. We Print & Ship', desc: 'We handle production and delivery to your door.', icon: Truck }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-white/10 group-hover:border-primary transition-colors flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                    <step.icon size={32} className="text-gray-400 group-hover:text-primary transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trending Now</h2>
                            <p className="text-gray-400">Popular items loved by our creators</p>
                        </div>
                        <Link to="/products" className="text-accent hover:text-white transition-colors flex items-center gap-2 group">
                            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: "10k+", label: "Happy Customers" },
                            { number: "50k+", label: "Products Printed" },
                            { number: "4.9/5", label: "Average Rating" },
                            { number: "24/7", label: "Support Team" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <h3 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    {stat.number}
                                </h3>
                                <p className="text-gray-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
