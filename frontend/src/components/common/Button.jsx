import { cn } from '../../utils/cn.js';
export function Button({ variant = 'primary', size = 'md', isLoading = false, children, className, disabled, ...props }) {
    return (<button className={cn('font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2', {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
            'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
            'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500': variant === 'outline',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
            'opacity-50 cursor-not-allowed': disabled || isLoading,
        }, className)} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>);
}
