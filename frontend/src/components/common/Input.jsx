import { cn } from '../../utils/cn.js';
export function Input({ label, error, className, ...props }) {
    return (<div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className={cn('w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', {
            'border-red-500': error,
        }, className)} {...props}/>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>);
}
