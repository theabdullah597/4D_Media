import { motion } from 'framer-motion';
import { Target, Lightbulb, Heart, Zap, Sparkles } from 'lucide-react';
import logo from '../assets/favicon.png';

function About() {
    return (
        <div className="min-h-screen bg-[#030014] pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-32 flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(112,0,255,0.15),transparent_70%)] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img src={logo} alt="4D Media" className="h-24 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(112,0,255,0.5)]" />
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
                            We Are <span className="text-primary">4D Media</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Your trusted partner in custom printing and personalized merchandise.
                            Bridging the gap between your imagination and reality.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Cards */}
            <div className="container mx-auto px-4 space-y-20">
                {/* Mission Section */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
                        <Target className="text-primary mb-6" size={48} />
                        <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed">
                            To empower creativity by providing accessible, affordable, and high-quality custom printing services
                            that turn ideas into tangible, beautiful products. We believe everyone deserves to express themselves clearly and vibrantly.
                        </p>
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 justify-center md:justify-start">
                            <Sparkles className="text-accent" /> Premium Quality
                        </h3>
                        <p className="text-gray-400 mb-6">
                            From small personal orders to large corporate campaigns, we handle every project with the same level of
                            care and attention to detail. Our state-of-the-art printing technology ensures your designs look exactly as you imagined.
                        </p>
                    </div>
                </motion.div>

                {/* Values Grid */}
                <div>
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: "Efficiency", desc: "Fast turnaround times without compromising on quality." },
                            { icon: Lightbulb, title: "Innovation", desc: "Constantly upgrading our tech to provide the best results." },
                            { icon: Heart, title: "Passion", desc: "We love what we do, and it shows in every print." },
                            { icon: Target, title: "Precision", desc: "Exact color matching and pixel-perfect details." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-2"
                            >
                                <item.icon className="text-accent mb-4" size={32} />
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
