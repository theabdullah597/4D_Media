import { useState } from 'react';
import { Search, X, Shapes, Hexagon, Star, Sparkles } from 'lucide-react';
import { SHAPES } from '../../utils/shapes';

const ABSRACT_PATHS = [
    { id: 'a1', viewBox: '0 0 200 200', path: 'M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-8.3C81.5,3.8,70.2,13.7,60.8,22.4C51.4,31.1,43.9,38.6,35.7,46.1C27.5,53.6,18.6,61.1,8.6,63.9C-1.4,66.7,-12.5,64.8,-24.1,60.6C-35.7,56.4,-47.8,49.9,-56.9,40.4C-66,30.9,-72.1,18.4,-73.4,5.4C-74.7,-7.6,-71.2,-21.1,-63.9,-32.8C-56.6,-44.5,-45.5,-54.4,-33.4,-62.7C-21.3,-71,-8.2,-77.7,3.9,-83.8C16,-89.9,32,-96.4,44.7,-76.4Z', label: 'Blob 1' },
    { id: 'a2', viewBox: '0 0 200 200', path: 'M41.3,-71.8C52.6,-66.2,60.3,-52.3,64.8,-39.2C69.3,-26.1,70.6,-13.7,72.4,0.1C74.2,13.9,76.5,29.1,70.9,41.9C65.3,54.7,51.8,65.1,38.2,69.5C24.6,73.9,10.9,72.3,-3.3,77.9C-17.5,83.5,-32.2,96.3,-45.1,91.8C-58,87.3,-69.1,65.5,-73.7,45.3C-78.3,25.1,-76.4,6.5,-71.2,-9.9C-66,-26.3,-57.5,-40.5,-46.8,-49.2C-36.1,-57.9,-23.2,-61.1,-10.8,-63.2C1.6,-65.3,13.2,-66.3,24.8,-67.3', label: 'Blob 2' },
    { id: 'a3', viewBox: '0 0 200 200', path: 'M 100 100 L 150 50 L 200 100 L 150 150 Z', label: 'Diamond' }, // Placeholder for complex abstract, key is simplicity
    { id: 'a4', viewBox: '0 0 24 24', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', label: 'Layers' },
    { id: 'a5', viewBox: '0 0 100 100', path: 'M10,50 Q50,10 90,50 Q50,90 10,50', label: 'Leaf' }
];

const BADGE_PATHS = [
    { id: 'b1', viewBox: '0 0 100 100', path: 'M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z', label: 'Hexagon Badge' },
    { id: 'b2', viewBox: '0 0 100 100', path: 'M50 0 L85 15 L100 50 L85 85 L50 100 L15 85 L0 50 L15 15 Z', label: 'Octagon' },
    { id: 'b3', viewBox: '0 0 100 100', path: 'M10 10 H90 V90 H10 Z M20 20 V80 H80 V20 H20', label: 'Frame' },
    { id: 'b4', viewBox: '0 0 24 24', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', label: 'Star Badge' },
    { id: 'b5', viewBox: '0 0 24 24', path: 'M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z', label: 'Lightning' }
];

const MINIMAL_PATHS = [
    { id: 'm1', viewBox: '0 0 24 24', path: 'M12 2L2 22h20L12 2z', label: 'Triangle' },
    { id: 'm2', viewBox: '0 0 24 24', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Heart' },
    { id: 'm3', viewBox: '0 0 24 24', path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', label: 'Star' },
    { id: 'm4', viewBox: '0 0 24 24', path: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', label: 'Plus' },
    { id: 'm5', viewBox: '0 0 24 24', path: 'M21 11H3v2h18v-2z', label: 'Line' }
];

const CATEGORIES = [
    { id: 'abstract', label: 'Abstract', icon: <Shapes size={14} />, assets: ABSRACT_PATHS },
    { id: 'badges', label: 'Badges', icon: <Hexagon size={14} />, assets: BADGE_PATHS },
    { id: 'minimal', label: 'Minimal', icon: <Sparkles size={14} />, assets: MINIMAL_PATHS },
    { id: 'shapes', label: 'Basic', icon: <Star size={14} />, assets: SHAPES },
];

export default function AssetsPanel({ onClose, onSelectAsset }) {
    const [selectedCat, setSelectedCat] = useState('abstract');
    const [search, setSearch] = useState('');

    const activeCategory = CATEGORIES.find(c => c.id === selectedCat) || CATEGORIES[0];
    const filteredAssets = activeCategory.assets.filter(a =>
        a.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-64 bg-[#1e293b] border-r border-white/10 flex flex-col h-full animate-slide-in-left absolute left-20 z-50 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white">Library</h3>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                    <X size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="p-2 grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCat(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedCat === cat.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="px-4 mb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        type="text"
                        placeholder={`Search ${activeCategory.label}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                    {filteredAssets.map(asset => (
                        <button
                            key={asset.id}
                            onClick={() => onSelectAsset({
                                ...asset,
                                type: 'shape',
                                shapeType: 'path',
                                fill: '#FFFFFF', // Default fill
                                backgroundColor: '#FFFFFF' // Fallback
                            }, 'shape')} // Treat everything as a shape now
                            className="aspect-square bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 hover:scale-105 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                            <svg
                                viewBox={asset.viewBox || "0 0 100 100"}
                                className="w-full h-full drop-shadow text-white fill-current group-hover:text-primary transition-colors"
                            >
                                <path d={asset.path} />
                            </svg>
                            <span className="text-[10px] text-gray-500 group-hover:text-white truncate w-full text-center">{asset.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
