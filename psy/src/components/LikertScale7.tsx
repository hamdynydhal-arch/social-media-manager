const OPTIONS = [
  { value: 1, short: '١', label: 'لا ينطبق\nإطلاقاً' },
  { value: 2, short: '٢', label: '' },
  { value: 3, short: '٣', label: '' },
  { value: 4, short: '٤', label: 'محايد' },
  { value: 5, short: '٥', label: '' },
  { value: 6, short: '٦', label: '' },
  { value: 7, short: '٧', label: 'ينطبق\nتماماً' },
];

interface LikertScale7Props {
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function LikertScale7({ value, onChange }: LikertScale7Props) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                flex flex-col items-center justify-center rounded-xl py-3 px-0.5
                border-2 transition-all duration-150 active:scale-95 min-h-[3.5rem]
                ${selected
                  ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50'
                }
              `}
            >
              <span className={`text-base font-bold leading-none ${selected ? 'text-white' : 'text-rose-400'}`}>
                {opt.short}
              </span>
              {opt.label ? (
                <span className={`text-[8px] text-center leading-tight whitespace-pre-line mt-1 ${selected ? 'text-rose-100' : 'text-gray-400'}`}>
                  {opt.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 px-0.5">
        <span className="text-xs text-gray-400">ينطبق تماماً ←</span>
        <span className="text-xs text-gray-400">→ لا ينطبق</span>
      </div>
    </div>
  );
}
