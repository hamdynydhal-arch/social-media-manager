const OPTIONS = [
  {
    value: 1, short: '1', label: 'لا ينطبق\nإطلاقاً',
    base:   'bg-nafees-copper/10 border-nafees-copper/20 hover:bg-nafees-copper/20 hover:border-nafees-copper/40',
    active: 'bg-nafees-copper/25 border-nafees-copper shadow-md',
    numBase: 'text-nafees-copper/40',   numActive: 'text-nafees-copper',
    lblActive: 'text-nafees-copper',
  },
  {
    value: 2, short: '2', label: 'نادراً',
    base:   'bg-nafees-warm/10 border-nafees-warm/20 hover:bg-nafees-warm/20 hover:border-nafees-warm/40',
    active: 'bg-nafees-warm/25 border-nafees-warm shadow-md',
    numBase: 'text-nafees-warm/50',     numActive: 'text-nafees-warm-dark',
    lblActive: 'text-nafees-warm-dark',
  },
  {
    value: 3, short: '3', label: 'أحياناً',
    base:   'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-300',
    active: 'bg-gray-200 border-gray-400 shadow-md shadow-gray-100',
    numBase: 'text-gray-400',           numActive: 'text-gray-700',
    lblActive: 'text-gray-700',
  },
  {
    value: 4, short: '4', label: 'غالباً',
    base:   'bg-nafees-sky/15 border-nafees-sky/25 hover:bg-nafees-sky/25 hover:border-nafees-sky/50',
    active: 'bg-nafees-sky/30 border-nafees-sky shadow-md',
    numBase: 'text-nafees-sky/70',      numActive: 'text-nafees-blue',
    lblActive: 'text-nafees-blue',
  },
  {
    value: 5, short: '5', label: 'ينطبق\nتماماً',
    base:   'bg-nafees-blue/10 border-nafees-blue/20 hover:bg-nafees-blue/20 hover:border-nafees-blue/40',
    active: 'bg-nafees-blue/20 border-nafees-blue shadow-md',
    numBase: 'text-nafees-blue/40',     numActive: 'text-nafees-navy',
    lblActive: 'text-nafees-navy',
  },
];

interface LikertScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="w-full">
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
                ${selected ? opt.active : opt.base}
              `}
            >
              <span className={`text-xl font-bold mb-1 ${selected ? opt.numActive : opt.numBase}`}>
                {opt.short}
              </span>
              <span className={`text-xs text-center leading-tight whitespace-pre-line ${selected ? opt.lblActive : 'text-gray-500'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs text-gray-400">ينطبق تماماً ←</span>
        <span className="text-xs text-gray-400">→ لا ينطبق</span>
      </div>
    </div>
  );
}
