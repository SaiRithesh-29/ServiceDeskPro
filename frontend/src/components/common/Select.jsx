import { cn } from '../../utils/cn.js';
export function Select({ label, error, className, options = [], placeholder, ...props }) {
    return (<div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className={cn('w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none', {
            'border-red-500': error,
            'text-gray-400': !props.value,
        }, className)} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>);
}
