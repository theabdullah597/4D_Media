import { useState } from 'react';
import { Search, X } from 'lucide-react';

// Helper to generate CDN URLs for Twemoji
const getEmojiUrl = (code) => `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${code}.png`;

const EMOJIS = [
    { code: '1f600', label: 'Grinning' }, { code: '1f603', label: 'Grinning Big' }, { code: '1f604', label: 'Grinning Eyes' },
    { code: '1f601', label: 'Beaming' }, { code: '1f606', label: 'Squinting' }, { code: '1f605', label: 'Sweat Smile' },
    { code: '1f923', label: 'ROFL' }, { code: '1f602', label: 'Tears of Joy' }, { code: '1f642', label: 'Slight Smile' },
    { code: '1f643', label: 'Upside Down' }, { code: '1f609', label: 'Wink' }, { code: '1f60a', label: 'Blush' },
    { code: '1f607', label: 'Halo' }, { code: '1f970', label: 'Hearts' }, { code: '1f60d', label: 'Heart Eyes' },
    { code: '1f929', label: 'Star Eyes' }, { code: '1f618', label: 'Kiss' }, { code: '1f617', label: 'Kissing' },
    { code: '1f61a', label: 'Kiss Closed' }, { code: '1f619', label: 'Kiss Smile' }, { code: '1f60b', label: 'Yum' },
    { code: '1f61b', label: 'Tongue' }, { code: '1f61c', label: 'Wink Tongue' }, { code: '1f92a', label: 'Zany' },
    { code: '1f61d', label: 'Squint Tongue' }, { code: '1f911', label: 'Money' }, { code: '1f917', label: 'Hug' },
    { code: '1f92d', label: 'Hand Over Mouth' }, { code: '1f92b', label: 'Shush' }, { code: '1f914', label: 'Think' },
    { code: '1f910', label: 'Zipper' }, { code: '1f928', label: 'Eyebrow' }, { code: '1f610', label: 'Neutral' },
    { code: '1f611', label: 'Expressionless' }, { code: '1f636', label: 'No Mouth' }, { code: '1f60f', label: 'Smirk' },
    { code: '1f612', label: 'Unamused' }, { code: '1f644', label: 'Roll Eyes' }, { code: '1f62c', label: 'Grimace' },
    { code: '1f925', label: 'Lie' }, { code: '1f60c', label: 'Relieved' }, { code: '1f614', label: 'Pensive' },
    { code: '1f62a', label: 'Sleepy' }, { code: '1f924', label: 'Drool' }, { code: '1f634', label: 'Sleeping' },
    { code: '1f637', label: 'Mask' }, { code: '1f912', label: 'Thermometer' }, { code: '1f915', label: 'Bandage' },
    { code: '1f922', label: 'Nauseated' }, { code: '1f92e', label: 'Vomit' }, { code: '1f927', label: 'Sneeze' },
    { code: '1f975', label: 'Hot' }, { code: '1f976', label: 'Cold' }, { code: '1f974', label: 'Woozy' },
    { code: '1f635', label: 'Dizzy' }, { code: '1f92f', label: 'Explode' }, { code: '1f920', label: 'Cowboy' },
    { code: '1f973', label: 'Party' }, { code: '1f60e', label: 'Sunglasses' }, { code: '1f913', label: 'Nerd' },
    { code: '1f9d0', label: 'Monocle' }, { code: '1f615', label: 'Confused' }, { code: '1f61f', label: 'Worried' },
    { code: '1f641', label: 'Slight Frown' }, { code: '1f62e', label: 'Open Mouth' }, { code: '1f62f', label: 'Hushed' },
    { code: '1f632', label: 'Astonished' }, { code: '1f633', label: 'Flushed' }, { code: '1f97a', label: 'Pleading' },
    { code: '1f626', label: 'Frowning' }, { code: '1f627', label: 'Anguished' }, { code: '1f628', label: 'Fearful' },
    { code: '1f630', label: 'Cold Sweat' }, { code: '1f625', label: 'Disappointed' }, { code: '1f622', label: 'Cry' },
    { code: '1f62d', label: 'Sob' }, { code: '1f631', label: 'Scream' }, { code: '1f616', label: 'Confounded' },
    { code: '1f623', label: 'Persevere' }, { code: '1f61e', label: 'Disappointed' }, { code: '1f613', label: 'Sweat' },
    { code: '1f629', label: 'Weary' }, { code: '1f62b', label: 'Tired' }, { code: '1f971', label: 'Yawn' },
    { code: '1f624', label: 'Triumph' }, { code: '1f621', label: 'Rage' }, { code: '1f620', label: 'Angry' },
    { code: '1f92c', label: 'Cursing' }, { code: '1f608', label: 'Smile Horns' }, { code: '1f47f', label: 'Imp' },
    { code: '1f480', label: 'Skull' }, { code: '2620', label: 'Skull Crossbones' }, { code: '1f4a9', label: 'Poop' },
    { code: '1f921', label: 'Clown' }, { code: '1f479', label: 'Ogre' }, { code: '1f47b', label: 'Ghost' },
    { code: '1f47d', label: 'Alien' }, { code: '1f47e', label: 'Space Invader' }, { code: '1f916', label: 'Robot' },
    { code: '1f43a', label: 'Wolf' }, { code: '1f981', label: 'Lion' }, { code: '1f42f', label: 'Tiger' },
    { code: '1f431', label: 'Cat' }, { code: '1f436', label: 'Dog' }, { code: '1f984', label: 'Unicorn' },
    { code: '2764', label: 'Heart Red' }, { code: '1f9e1', label: 'Heart Orange' }, { code: '1f49b', label: 'Heart Yellow' },
    { code: '1f49a', label: 'Heart Green' }, { code: '1f499', label: 'Heart Blue' }, { code: '1f49c', label: 'Heart Purple' },
    { code: '1f525', label: 'Fire' }, { code: '2b50', label: 'Star' }, { code: '1f308', label: 'Rainbow' }
];

// Mock Assets Data
const ASSETS = {
    icons: [
        { id: 'i1', src: 'https://cdn-icons-png.flaticon.com/512/25/25231.png', label: 'GitHub' },
        { id: 'i2', src: 'https://cdn-icons-png.flaticon.com/512/61/61109.png', label: 'LinkedIn' },
        ...EMOJIS.map((e, i) => ({ id: `e${i}`, src: getEmojiUrl(e.code), label: e.label }))
    ],
    patterns: [
        { id: 'p1', src: 'https://img.freepik.com/free-vector/seamless-gold-rhombus-grid-pattern-black-background_53876-97589.jpg', label: 'Geo' },
        { id: 'p2', src: 'https://img.freepik.com/free-vector/colorful-memphis-pattern-background-vector_53876-156094.jpg', label: 'Memphis' },
        { id: 'p3', src: 'https://img.freepik.com/free-vector/organic-flat-abstract-shapes-pattern-design_23-2148924843.jpg?w=740', label: 'Organic' }
    ]
};

export default function AssetsPanel({ onClose, onSelectAsset }) {
    const [category, setCategory] = useState('icons');
    const [search, setSearch] = useState('');

    const filteredAssets = ASSETS[category]?.filter(a =>
        a.label.toLowerCase().includes(search.toLowerCase())
    ) || [];

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
            <div className="flex p-2 gap-1 bg-black/20 mx-4 mt-4 rounded-lg">
                <button
                    onClick={() => setCategory('icons')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${category === 'icons' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Icons
                </button>
                <button
                    onClick={() => setCategory('patterns')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${category === 'patterns' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Patterns
                </button>
            </div>

            {/* Search */}
            <div className="px-4 mt-4 mb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        type="text"
                        placeholder={`Search ${category}...`}
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
                            onClick={() => onSelectAsset(asset.src, category === 'patterns' ? 'pattern' : 'image')}
                            className="aspect-square bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 rounded-xl p-2 flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                            <img src={asset.src} className="w-full h-full object-contain drop-shadow" alt={asset.label} />
                            {/* <span className="text-[10px] text-gray-500 group-hover:text-white">{asset.label}</span> */}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
