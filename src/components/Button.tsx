import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'primary',
          'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
          'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500': variant === 'danger',
          'px-2.5 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;