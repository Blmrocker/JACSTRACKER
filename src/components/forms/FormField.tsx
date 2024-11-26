import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface FormFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  label: string;
  name: string;
  type?: string;
  className?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

export function FormField({ 
  label, 
  name, 
  type = 'text', 
  className,
  as = 'input',
  rows,
  ...props 
}: FormFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  const inputClasses = clsx(
    'block w-full rounded-md shadow-sm',
    error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
  );

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        {as === 'textarea' ? (
          <textarea
            id={name}
            rows={rows}
            {...register(name)}
            {...props}
            className={inputClasses}
          />
        ) : (
          <input
            id={name}
            type={type}
            {...register(name)}
            {...props}
            className={inputClasses}
          />
        )}
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error.message as string}</p>
      )}
    </div>
  );
}