import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

function WhatsAppButton() {
    const whatsappNumber = '1234567890'; // Replace with actual number
    const message = 'Hello! I have a question about your custom printing services.';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] cursor-pointer group"
            title="Chat with us on WhatsApp"
        >
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping opacity-20" />
            <MessageCircle size={32} color="white" fill="white" className="relative z-10" />
        </motion.a>
    );
}

export default WhatsAppButton;
