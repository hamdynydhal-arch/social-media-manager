const OPTIONS = [
  {
    value: 1, short: '1', label: 'لا ينطبق\nإطلاقاً',
    base:   'bg-nafees-copper/10 border-nafees-copper/20 hover:bg-nafees-copper/20 hover:border-nafees-copper/40',
    active: 'bg-nafees-copper/25 border-nafees-copper shadow-md',
    numBase: 'text-nafees-copper/40',   numActive: 'text-nafees-copper',
    lblActive: 'text-nafees-copper',
  },
  {
    value: 2, short: '2', label: '',
    base:   'bg-nafees-warm/10 border-nafees-warm/20 hover:bg-nafees-warm/20 hover:border-nafees-warm/40',
    active: 'bg-nafees-warm/25 border-nafees-warm shadow-md',
    numBase: 'text-nafees-warm/50',     numActive: 'text-nafees-warm-dark',
    lblActive: 'text-nafees-warm-dark',
  },
  {
    value: 3, short: '3', label: '',
    base:   'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-300',
    active: 'bg-gray-200 border-gray-400 shadow-md shadow-gray-100',
    numBase: 'text-gray-400',           numActive: 'text-gray-700',
    lblActive: 'text-gray-700',
  },
  {
    value: 4, short: '4', label: '',
    base:   'bg-nafees-sky/15 border-nafees-sky/25 hover:bg-nafees-sky/25 hover:border-nafees-sky/50',
    active: 'bg-nafees-sky/30 border-nafees-sky shadow-md',
    numBase: 'text-nafees-sky/70',      numActive: 'text-nafees-blue',
    lblActive: 'text-nafees-blue',
  },
  {
    value: 5, short: '5', label: '',
    base:   'bg-nafees-sage/10 border-nafees-sage/20 hover:bg-nafees-sage/20 hover:border-nafees-sage/40',
    active: 'bg-nafees-sage/25 border-nafees-sage shadow-md',
    numBase: 'text-nafees-sage/50',     numActive: 'text-nafees-sage',
    lblActive: 'text-nafees-sage',
  },
  {
    value: 6, short: '6', label: 'ينطبق\nتماماً',
    base:   'bg-nafees-blue/10 border-nafees-blue/20 hover:bg-nafees-blue/20 hover:border-nafees-blue/40',
    active: 'bg-nafees-blue/20 border-nafees-blue shadow-md',
    numBase: 'text-nafees-blue/40',     numActive: 'text-nafees-navy',
    lblActive: 'text-nafees-navy',
  },
];

interface LikertScale6Props {
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function LikertScale6({ value, onChange }: LikertScale6Props) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-1.5">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                flex flex-col items-center justify-center rounded-xl py-3 px-0.5
                border-2 transition-all duration-150 active:scale-95 min-h-[3.5rem]
                ${selected ? opt.active : opt.base}
              `}
            >
              <span className={`text-base font-bold leading-none ${selected ? opt.numActive : opt.numBase}`}>
                {opt.short}
              </span>
              {opt.label ? (
                <span className={`text-[8px] text-center leading-tight whitespace-pre-line mt-1 ${selected ? opt.lblActive : 'text-gray-400'}`}>
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
