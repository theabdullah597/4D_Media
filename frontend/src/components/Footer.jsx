import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../assets/logo.jpg';

function Footer() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();

    if (location.pathname.toLowerCase().startsWith('/admin')) return null;

    return (
        <footer className="relative bg-[#020010] border-t border-white/5 pt-20 pb-10 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="4D Media" className="h-10 w-auto" />
                            <span className="text-2xl font-bold text-white">4D Media</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your trusted partner for custom printing and personalized merchandise.
                            Bringing your creative visions to life with premium quality products.
                        </p>

                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/products', label: 'Products' },
                                { to: '/customize', label: 'Create Design' },
                                { to: '/about', label: 'About Us' },
                                { to: '/contact', label: 'Contact' }
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Products</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Custom T-Shirts', query: 'shirt' },
                                { label: 'Personalized Mugs', query: 'mug' },
                                { label: 'Custom Hoodies', query: 'hoodie' },
                                { label: 'Branded Caps', query: 'cap' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={`/products?search=${item.query}`}
                                        className="text-gray-400 text-sm hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:info@4dmedia.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm group">
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <Mail size={16} className="text-primary" />
                                    </div>
                                    info@4dmedia.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+1234567890" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm group">
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <Phone size={16} className="text-primary" />
                                    </div>
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm group">
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors mt-1">
                                    <MapPin size={16} className="text-primary" />
                                </div>
                                <span className="leading-relaxed">123 Print Street,<br />Design City, ST 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {currentYear} 4D Media. All rights reserved. | Crafted with <span className="text-red-500 animate-pulse">❤️</span> for creative minds
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
