import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface FormMultiSelectProps
  extends React.ComponentPropsWithoutRef<'select'> {
  label: string;
  name: string;
  options: Option[];
  className?: string;
  placeholder?: string;
}

export function FormMultiSelect({
  label,
  name,
  options,
  className,
  // placeholder = 'Select options',
  ...props
}: FormMultiSelectProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div className={className}>
      <label htmlFor={name} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <div className='relative mt-1'>
        <select
          id={name}
          multiple
          {...register(name)}
          {...props}
          className={clsx(
            'block w-full rounded-md shadow-sm',
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-8'>
            <AlertCircle className='h-5 w-5 text-red-500' aria-hidden='true' />
          </div>
        )}
      </div>
      {error && (
        <p className='mt-2 text-sm text-red-600'>{error.message as string}</p>
      )}
    </div>
  );
}
