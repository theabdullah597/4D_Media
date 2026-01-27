import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Phone, MessageCircle, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
// import { generalAPI } from '../utils/api';

function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("https://formspree.io/f/meeayayk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 5000);
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-4 text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold text-white mb-4"
                >
                    Get In <span className="text-primary">Touch</span>
                </motion.h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Have questions about our products or custom orders? We're here to help you create something amazing.
                </p>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {[
                            { icon: Mail, title: "Email Us", value: "info@4dmedia.com", link: "mailto:info@4dmedia.com" },
                            { icon: Phone, title: "Call Us", value: "+1 (234) 567-890", link: "tel:+1234567890" },
                            { icon: MessageCircle, title: "WhatsApp", value: "Chat with us", link: "https://wa.me/1234567890" },
                            { icon: MapPin, title: "Visit Us", value: "123 Print Street, Design City", link: "#" }
                        ].map((item, idx) => (
                            <motion.a
                                key={idx}
                                href={item.link}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-4 bg-[#1e293b] p-6 rounded-2xl border border-white/10 hover:border-primary transition-all group"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{item.title}</h3>
                                    <p className="text-gray-400 text-sm group-hover:text-white transition-colors">{item.value}</p>
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-[#1e293b] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

                        <h2 className="text-2xl font-bold text-white mb-8 relative z-10">Send us a Message</h2>

                        {submitted ? (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl flex items-center gap-4">
                                <CheckCircle2 size={24} />
                                <div>
                                    <h4 className="font-bold">Message Sent!</h4>
                                    <p className="text-sm opacity-80">We'll get back to you within 24 hours.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium">Your Name</label>
                                        <input
                                            type="text" name="name" required value={formData.name} onChange={handleChange}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium">Email Address</label>
                                        <input
                                            type="email" name="email" required value={formData.email} onChange={handleChange}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Phone Number</label>
                                    <input
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                        placeholder="+1 (234) 567-890"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Message</label>
                                    <textarea
                                        name="message" required value={formData.message} onChange={handleChange}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-32 resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
