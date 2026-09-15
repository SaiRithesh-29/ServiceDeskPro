import { AlertCircle, CheckCircle, InfoIcon, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';
export function Alert({ type = 'info', message, title, onClose }) {
    const bgColors = {
        info: 'bg-blue-50 border-blue-200',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200',
        error: 'bg-red-50 border-red-200',
    };
    const textColors = {
        info: 'text-blue-800',
        success: 'text-green-800',
        warning: 'text-yellow-800',
        error: 'text-red-800',
    };
    const icons = {
        info: <InfoIcon className="w-5 h-5"/>,
        success: <CheckCircle className="w-5 h-5"/>,
        warning: <AlertCircle className="w-5 h-5"/>,
        error: <XCircle className="w-5 h-5"/>,
    };
    return (<div className={cn('p-4 rounded-lg border flex gap-3', bgColors[type])}>
      <div className={cn(textColors[type])}>{icons[type]}</div>
      <div className="flex-1">
        {title && <h4 className={cn('font-semibold', textColors[type])}>{title}</h4>}
        <p className={cn(textColors[type])}>{message}</p>
      </div>
      {onClose && (<button onClick={onClose} className={cn('text-gray-500 hover:text-gray-700')}>
          ✕
        </button>)}
    </div>);
}
