import { Layers, Eye, EyeOff, Trash2, GripVertical, Lock, Unlock } from 'lucide-react';

export default function LayersPanel({ elements, selectedId, onSelect, onDelete, onToggleVisibility, onToggleLock }) {
    // Reverse elements for layer order (top on top)
    const layers = [...elements].reverse();

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                <h3 className="font-bold text-sm">Layers</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {layers.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 py-8">
                        No layers yet
                    </div>
                ) : (
                    layers.map(el => (
                        <div
                            key={el.id}
                            onClick={() => onSelect(el.id)}
                            className={`
                                group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                ${selectedId === el.id
                                    ? 'bg-primary/20 border-primary/50'
                                    : 'bg-[#0f172a] border-white/5 hover:bg-white/5 hover:border-white/10'}
                            `}
                        >
                            <div className="cursor-grab text-gray-600 hover:text-white">
                                <GripVertical size={14} />
                            </div>

                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                {el.type === 'image' ? (
                                    <img src={el.src} className="w-full h-full object-cover" alt="layer" />
                                ) : (
                                    <span className="text-xs font-bold text-gray-400">T</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate text-gray-200">
                                    {el.type === 'text' ? (el.content || 'Text Layer') : 'Image Layer'}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase">{el.type}</p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleLock && onToggleLock(el.id); }}
                                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                >
                                    {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleVisibility && onToggleVisibility(el.id); }}
                                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                >
                                    {el.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                                    className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
