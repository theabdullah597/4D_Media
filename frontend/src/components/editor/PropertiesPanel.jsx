import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type as TypeIcon, Image as ImageIcon, Shapes, Trash2 } from 'lucide-react';

const fonts = [
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Impact', value: 'Impact' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS' },
    { name: 'Outfit', value: 'Outfit' },
    { name: 'Playfair Display', value: 'Playfair Display' },
];

export default function PropertiesPanel({ element, onChange, onDelete }) {
    if (!element) return (
        <div className="p-6 text-center text-gray-500 text-sm">
            Select an element to edit properties
        </div>
    );

    const handleChange = (key, value) => {
        onChange({ [key]: value });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                    {element.type === 'text' ? <TypeIcon size={16} /> : <ImageIcon size={16} />}
                </div>
                <h3 className="font-bold text-gray-200 uppercase text-xs tracking-wider">
                    {element.type} Properties
                </h3>
            </div>

            {element.type === 'text' && (
                <>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-gray-400 block mb-2 font-medium">
                                Text Content <span className="text-[10px] text-gray-500 font-normal">(Type below)</span>
                            </label>
                            <textarea
                                value={element.content}
                                onChange={(e) => handleChange('content', e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors min-h-[60px] resize-none focus:bg-[#1e293b]"
                                placeholder="Type your text here..."
                            />
                        </div>

                        {/* Font & Size */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-2 font-medium">Typography</label>
                            <div className="space-y-2">
                                <select
                                    value={element.fontFamily}
                                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                >
                                    {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                </select>

                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            value={element.fontSize || 24}
                                            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm focus:border-primary outline-none"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-500">px</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden relative cursor-pointer group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 pointer-events-none" />
                                        <input
                                            type="color"
                                            value={element.color || '#000000'}
                                            onChange={(e) => handleChange('color', e.target.value)}
                                            className="absolute inset-[-4px] w-[150%] h-[150%] cursor-pointer p-0 border-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alignment & Style */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-2 font-medium">Style & Align</label>
                            <div className="flex bg-[#0f172a] rounded-lg border border-white/10 p-1 gap-1">
                                <StyleButton
                                    active={element.fontWeight === 'bold'}
                                    onClick={() => handleChange('fontWeight', element.fontWeight === 'bold' ? 'normal' : 'bold')}
                                    icon={<Bold size={14} />}
                                />
                                <StyleButton
                                    active={element.fontStyle === 'italic'}
                                    onClick={() => handleChange('fontStyle', element.fontStyle === 'italic' ? 'normal' : 'italic')}
                                    icon={<Italic size={14} />}
                                />
                                <StyleButton
                                    active={element.textTransform === 'uppercase'}
                                    onClick={() => handleChange('textTransform', element.textTransform === 'uppercase' ? 'none' : 'uppercase')}
                                    icon={<span className="text-[10px] font-bold">TT</span>}
                                />
                                <div className="w-[1px] bg-white/10 mx-1" />
                                <StyleButton
                                    active={element.textAlign === 'left'}
                                    onClick={() => handleChange('textAlign', 'left')}
                                    icon={<AlignLeft size={14} />}
                                />
                                <StyleButton
                                    active={element.textAlign === 'center'}
                                    onClick={() => handleChange('textAlign', 'center')}
                                    icon={<AlignCenter size={14} />}
                                />
                                <StyleButton
                                    active={element.textAlign === 'right'}
                                    onClick={() => handleChange('textAlign', 'right')}
                                    icon={<AlignRight size={14} />}
                                />
                            </div>
                        </div>

                        {/* Spacing */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-2 font-medium">Spacing</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 mb-1 block">Letter Spacing</label>
                                    <input
                                        type="number"
                                        value={element.letterSpacing || 0}
                                        onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded px-2 py-1 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 mb-1 block">Line Height</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={element.lineHeight || 1.2}
                                        onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded px-2 py-1 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Effects (Outline & Shadow) */}
                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Effects</h4>

                            {/* Outline */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-gray-400 font-medium">Outline</label>
                                    <div className="w-6 h-6 rounded border border-white/10 overflow-hidden relative cursor-pointer">
                                        <input
                                            type="color"
                                            value={element.outlineColor || '#000000'}
                                            onChange={(e) => handleChange('outlineColor', e.target.value)}
                                            className="absolute inset-[-2px] w-[150%] h-[150%] cursor-pointer p-0 border-none"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={element.outlineWidth || 0}
                                    onChange={(e) => handleChange('outlineWidth', parseFloat(e.target.value))}
                                    className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Shadow */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-gray-400 font-medium">Shadow</label>
                                    <div className="w-6 h-6 rounded border border-white/10 overflow-hidden relative cursor-pointer">
                                        <input
                                            type="color"
                                            value={element.shadowColor || '#000000'}
                                            onChange={(e) => handleChange('shadowColor', e.target.value)}
                                            className="absolute inset-[-2px] w-[150%] h-[150%] cursor-pointer p-0 border-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500 w-8">Blur</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="20"
                                            value={element.shadowBlur || 0}
                                            onChange={(e) => handleChange('shadowBlur', parseFloat(e.target.value))}
                                            className="flex-1 accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500 w-8">X-Off</span>
                                        <input
                                            type="range"
                                            min="-20"
                                            max="20"
                                            value={element.shadowOffsetX || 0}
                                            onChange={(e) => handleChange('shadowOffsetX', parseFloat(e.target.value))}
                                            className="flex-1 accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {element.type === 'image' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 block mb-2 font-medium">Opacity</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={element.opacity ?? 1}
                            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                            <span>0%</span>
                            <span>{Math.round((element.opacity ?? 1) * 100)}%</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                        Drag corners to resize. Rotate using the top handle.
                    </div>
                </div>
            )}

            {element.type === 'shape' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 block mb-2 font-medium">Shape Color</label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden relative cursor-pointer shadow-lg">
                                <input
                                    type="color"
                                    value={element.backgroundColor || element.fill || '#000000'}
                                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                    className="absolute inset-[-4px] w-[150%] h-[150%] cursor-pointer p-0 border-none"
                                />
                            </div>
                            <span className="text-xs font-mono text-gray-400">{element.backgroundColor || element.fill || '#000000'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 block mb-2 font-medium">Dimensions</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-500 mb-1 block">Width</label>
                                <input
                                    type="number"
                                    value={Math.round(element.width || 0)}
                                    onChange={(e) => handleChange('width', parseInt(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded px-2 py-1 text-xs"
                                    placeholder="W"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 mb-1 block">Height</label>
                                <input
                                    type="number"
                                    value={Math.round(element.height || 0)}
                                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded px-2 py-1 text-xs"
                                    placeholder="H"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-6 border-t border-white/10 mt-6">
                <button
                    onClick={onDelete}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-3 rounded-lg border border-red-500/20 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                    <Trash2 size={14} />
                    DELETE ELEMENT
                </button>
            </div>
        </div>
    );
}

function StyleButton({ active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 h-8 flex items-center justify-center rounded transition-colors ${active ? 'bg-primary text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
        >
            {icon}
        </button>
    );
}
