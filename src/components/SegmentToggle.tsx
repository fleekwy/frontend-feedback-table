interface SegmentToggleProps {
    leftLabel: string;
    rightLabel: string;
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
}

export function SegmentToggle({
    leftLabel,
    rightLabel,
    enabled,
    onChange,
    disabled = false,
}: SegmentToggleProps) {
    return (
        <div
            className={`
                flex items-center justify-center
                w-64 h-11
                rounded-lg
                overflow-hidden
                cursor-pointer
                transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
            `}
            onClick={disabled ? undefined : onChange}
        >
            {/* Left segment */}
            <div
                className={`
                    flex-1 h-full
                    flex items-center justify-center
                    transition-all duration-200
                    ${enabled ? 'bg-slate-200 text-slate-500' : 'bg-blue-500 text-white'}
                `}
            >
                <span className="text-md font-medium whitespace-nowrap px-2">{leftLabel}</span>
            </div>

            {/* Right segment */}
            <div
                className={`
                    flex-1 h-full
                    flex items-center justify-center
                    transition-all duration-200
                    ${enabled ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}
                `}
            >
                <span className="text-md font-medium whitespace-nowrap px-2">{rightLabel}</span>
            </div>
        </div>
    );
}
