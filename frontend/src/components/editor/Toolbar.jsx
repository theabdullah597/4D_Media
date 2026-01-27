import { Upload, Type, Square, Hexagon, Circle, Library, Link } from 'lucide-react';

export default function Toolbar({ onAddText, onUploadImage, onAddShape, onOpenLibrary, activeTool }) {
    return (
        <div className="w-full lg:w-20 h-auto lg:h-full bg-[#1e293b] border-t lg:border-b-0 lg:border-r border-white/10 flex flex-row lg:flex-col items-center justify-center lg:justify-start py-4 lg:py-6 gap-6 z-30 overflow-x-auto flex-shrink-0">
            <ToolButton
                icon={<Library size={24} />}
                label="Library"
                onClick={onOpenLibrary}
                isActive={activeTool === 'assets'}
            />
            <ToolButton
                icon={<Upload size={24} />}
                label="Upload"
                onClick={onUploadImage}
            />
            <ToolButton
                icon={<Type size={24} />}
                label="Text"
                onClick={onAddText}
            />
            <div className="w-[1px] h-8 lg:w-10 lg:h-[1px] bg-white/10 my-0 lg:my-2" />
            <ToolButton
                icon={<Square size={24} />}
                label="Square"
                onClick={() => onAddShape && onAddShape('rect')}
            />
            <ToolButton
                icon={<Circle size={24} />}
                label="Circle"
                onClick={() => onAddShape && onAddShape('circle')}
            />
            <ToolButton
                icon={<Hexagon size={24} />} // Using Hexagon as generic polygon/triangle icon
                label="Triangle"
                onClick={() => onAddShape && onAddShape('triangle')}
            />
            {/* Add more tools here */}
        </div>
    );
}

function ToolButton({ icon, label, onClick, isActive }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 group p-2 rounded-xl transition-all ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-black/20 ${isActive ? 'bg-primary text-white shadow-primary/30' : 'bg-white/5 text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/30'}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{label}</span>
        </button>
    );
}
