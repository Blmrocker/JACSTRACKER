import { AlertCircle } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className='text-center py-12'>
      <AlertCircle className='mx-auto h-12 w-12 text-gray-400' />
      <h3 className='mt-2 text-sm font-semibold text-gray-900'>{title}</h3>
      <p className='mt-1 text-sm text-gray-500'>{description}</p>
      {action && (
        <div className='mt-6'>
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
