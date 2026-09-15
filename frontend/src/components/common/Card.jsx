import { cn } from '../../utils/cn.js';
export function Card({ children, className, hover = false }) {
    return (<div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', {
            'hover:shadow-md transition-shadow': hover,
        }, className)}>
      {children}
    </div>);
}
export function CardHeader({ children, className }) {
    return <div className={cn('px-6 py-4 border-b border-gray-200', className)}>{children}</div>;
}
export function CardContent({ children, className }) {
    return <div className={cn('px-6 py-4', className)}>{children}</div>;
}
export function CardFooter({ children, className }) {
    return <div className={cn('px-6 py-4 border-t border-gray-200 flex justify-end gap-2', className)}>{children}</div>;
}
