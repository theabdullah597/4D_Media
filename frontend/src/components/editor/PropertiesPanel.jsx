import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type as TypeIcon, Image as ImageIcon, Shapes } from 'lucide-react';

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

export default function PropertiesPanel({ element, onChange }) {
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
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-2 font-medium">Content</label>
                            <textarea
                                value={element.content}
                                onChange={(e) => handleChange('content', e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors min-h-[80px] resize-none"
                            />
                        </div>

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
                                    <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden relative cursor-pointer">
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
                    {/* Add filters later */}
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
                                    value={Math.round(element.width)}
                                    onChange={(e) => handleChange('width', parseInt(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded px-2 py-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 mb-1 block">Height</label>
                                <input
                                    type="number"
                                    value={Math.round(element.height)}
                                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded px-2 py-1 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
