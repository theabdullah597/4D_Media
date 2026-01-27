import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

function ProductCard({ product }) {
    return (
        <Link to={`/customize/${product.id}`} className="block h-full group">
            <motion.div
                whileHover={{ y: -10 }}
                className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(112,0,255,0.2)]"
            >
                {/* Image Container with Carousel */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-white/5 to-white/10 p-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,0,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500">
                        {/* Show Active View */}
                        {product.views && product.views.length > 0 ? (
                            <ProductCarousel views={product.views} defaultImage={product.image_url} />
                        ) : (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            />
                        )}
                    </div>

                    {/* Badge */}
                    {product.category_name && (
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 z-10">
                            {product.category_name}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                        {product.description || 'Customize this product with your unique design. Premium quality materials.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">Starting from</span>
                            <span className="text-2xl font-bold text-white">
                                £{parseFloat(product.base_price).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 group-hover:bg-primary text-white px-4 py-2 rounded-lg transition-all border border-white/10">
                            <Sparkles size={16} />
                            <span>Design</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Internal Carousel Component
import { useState } from 'react';
function ProductCarousel({ views, defaultImage }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const images = views.length > 0 ? views : [{ image_url: defaultImage, view_name: 'Front' }];

    return (
        <div className="w-full h-full flex flex-col items-center relative"
            onMouseEnter={() => { if (images.length > 1) setActiveIndex(1); }}
            onMouseLeave={() => setActiveIndex(0)}
        >
            <img
                src={images[activeIndex]?.image_url || defaultImage}
                alt="Product View"
                className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500"
            />

            {/* Carousel Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-2 flex gap-1 z-20">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeIndex ? 'bg-primary w-3' : 'bg-gray-500'}`}
                        />
                    ))}
                </div>
            )}

            {/* View Label */}
            {images.length > 1 && (
                <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    {images[activeIndex]?.view_name || 'View'}
                </div>
            )}
        </div>
    );
}

export default ProductCard;
