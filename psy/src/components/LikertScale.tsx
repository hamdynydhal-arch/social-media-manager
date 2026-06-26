const OPTIONS = [
  { value: 1, label: 'لا ينطبق\nإطلاقاً', short: '١' },
  { value: 2, label: 'نادراً', short: '٢' },
  { value: 3, label: 'أحياناً', short: '٣' },
  { value: 4, label: 'غالباً', short: '٤' },
  { value: 5, label: 'ينطبق\nتماماً', short: '٥' },
];

interface LikertScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="w-full">
      {/* Mobile: big tap targets */}
      <div className="grid grid-cols-5 gap-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                flex flex-col items-center justify-center rounded-2xl py-3 px-1
                border-2 transition-all duration-150 active:scale-95
                ${selected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                }
              `}
            >
              <span className={`text-xl font-bold mb-1 ${selected ? 'text-white' : 'text-indigo-400'}`}>
                {opt.short}
              </span>
              <span className={`text-xs text-center leading-tight whitespace-pre-line ${selected ? 'text-indigo-100' : 'text-gray-500'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs text-gray-400">ينطبق تماماً ←</span>
        <span className="text-xs text-gray-400">→ لا ينطبق</span>
      </div>
    </div>
  );
}
