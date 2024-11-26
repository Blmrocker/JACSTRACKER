import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function Form({
  form,
  onSubmit,
  children,
  className,
  ...props
}: FormProps) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}
