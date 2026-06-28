const OPTIONS = [
  {
    value: 1, short: '1', label: 'لا ينطبق\nإطلاقاً',
    base:   'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-300',
    active: 'bg-red-100 border-red-400 shadow-md shadow-red-100',
    numBase: 'text-red-300',     numActive: 'text-red-700',
    lblActive: 'text-red-700',
  },
  {
    value: 2, short: '2', label: '',
    base:   'bg-rose-50 border-rose-100 hover:bg-rose-100 hover:border-rose-300',
    active: 'bg-rose-100 border-rose-400 shadow-md shadow-rose-100',
    numBase: 'text-rose-300',    numActive: 'text-rose-700',
    lblActive: 'text-rose-700',
  },
  {
    value: 3, short: '3', label: '',
    base:   'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-300',
    active: 'bg-gray-200 border-gray-400 shadow-md shadow-gray-100',
    numBase: 'text-gray-400',    numActive: 'text-gray-700',
    lblActive: 'text-gray-700',
  },
  {
    value: 4, short: '4', label: '',
    base:   'bg-teal-50 border-teal-100 hover:bg-teal-100 hover:border-teal-300',
    active: 'bg-teal-100 border-teal-400 shadow-md shadow-teal-100',
    numBase: 'text-teal-300',    numActive: 'text-teal-700',
    lblActive: 'text-teal-700',
  },
  {
    value: 5, short: '5', label: '',
    base:   'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300',
    active: 'bg-emerald-100 border-emerald-400 shadow-md shadow-emerald-100',
    numBase: 'text-emerald-300', numActive: 'text-emerald-700',
    lblActive: 'text-emerald-700',
  },
  {
    value: 6, short: '6', label: 'ينطبق\nتماماً',
    base:   'bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-400',
    active: 'bg-green-100 border-green-500 shadow-md shadow-green-100',
    numBase: 'text-green-400',   numActive: 'text-green-700',
    lblActive: 'text-green-700',
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
