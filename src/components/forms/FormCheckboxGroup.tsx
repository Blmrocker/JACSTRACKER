import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface FormCheckboxGroupProps {
  label: string;
  name: string;
  options: Option[];
  className?: string;
}

export function FormCheckboxGroup({
  label,
  name,
  options,
  className,
}: FormCheckboxGroupProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];
  // const selectedValues = watch(name) || [];

  return (
    <div className={className}>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {label}
      </label>
      <div className='space-y-2'>
        {options.map((option) => (
          <label
            key={option.value}
            className='inline-flex items-center mr-4 mb-2'
          >
            <input
              type='checkbox'
              value={option.value}
              {...register(name)}
              className={clsx(
                'h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500',
                error && 'border-red-300'
              )}
            />
            <span className='ml-2 text-sm text-gray-900'>{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className='mt-1 text-sm text-red-600'>{error.message as string}</p>
      )}
    </div>
  );
}
