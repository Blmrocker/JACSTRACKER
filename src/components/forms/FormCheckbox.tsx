import React from 'react';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';

interface FormCheckboxProps extends React.ComponentPropsWithoutRef<'input'> {
  label: string;
  name: string;
  className?: string;
}

export function FormCheckbox({ label, name, className, ...props }: FormCheckboxProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={clsx('flex items-start', className)}>
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          id={name}
          {...register(name)}
          {...props}
          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
      </div>
      <div className="ml-3">
        <label htmlFor={name} className="text-sm text-gray-700">
          {label}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error.message as string}</p>
        )}
      </div>
    </div>
  );
}