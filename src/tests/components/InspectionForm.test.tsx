// import { describe, it, expect, vi } from 'vitest';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { InspectionForm } from '../../components/inspections/InspectionForm';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { inspectionSchema } from '../../lib/validations';

// // Mock react-hook-form
// vi.mock('react-hook-form', () => ({
//   useForm: vi.fn(),
//   FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
//   useFormContext: () => ({
//     register: () => ({}),
//     formState: { errors: {} },
//   }),
// }));

// describe('InspectionForm', () => {
//   const mockClientOptions = [
//     { value: '1', label: 'Client 1' },
//     { value: '2', label: 'Client 2' },
//   ];

//   const mockForm = {
//     handleSubmit: vi.fn(),
//     register: vi.fn(),
//     setValue: vi.fn(),
//     watch: vi.fn(),
//     formState: {
//       errors: {},
//       isSubmitting: false,
//     },
//     getValues: vi.fn(),
//   };

//   const defaultProps = {
//     form: mockForm as any,
//     onSubmit: vi.fn(),
//     onCancel: vi.fn(),
//     clientOptions: mockClientOptions,
//     isEdit: false,
//   };

//   beforeEach(() => {
//     vi.clearAllMocks();
//     (useForm as any).mockReturnValue(mockForm);
//   });

//   it('renders form fields correctly', () => {
//     render(<InspectionForm {...defaultProps} />);

//     expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/inspection date/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/inspector/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
//   });

//   it('handles form submission', async () => {
//     const onSubmit = vi.fn();
//     render(<InspectionForm {...defaultProps} onSubmit={onSubmit} />);

//     const submitButton = screen.getByRole('button', { name: /save inspection/i });
//     await userEvent.click(submitButton);

//     expect(mockForm.handleSubmit).toHaveBeenCalled();
//   });

//   it('handles file uploads', async () => {
//     render(<InspectionForm {...defaultProps} />);

//     const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
//     const fileInput = screen.getByLabelText(/manual inspection files/i);

//     await waitFor(() => {
//       fireEvent.change(fileInput, { target: { files: [file] } });
//     });

//     expect(screen.getByText('test.pdf')).toBeInTheDocument();
//   });

//   it('displays loading state during submission', () => {
//     const submittingForm = {
//       ...mockForm,
//       formState: {
//         ...mockForm.formState,
//         isSubmitting: true,
//       },
//     };

//     render(<InspectionForm {...defaultProps} form={submittingForm as any} />);

//     expect(screen.getByText(/saving/i)).toBeInTheDocument();
//   });

//   it('handles cancellation', async () => {
//     const onCancel = vi.fn();
//     render(<InspectionForm {...defaultProps} onCancel={onCancel} />);

//     const cancelButton = screen.getByRole('button', { name: /cancel/i });
//     await userEvent.click(cancelButton);

//     expect(onCancel).toHaveBeenCalled();
//   });

//   it('validates required fields', async () => {
//     const form = useForm({
//       resolver: zodResolver(inspectionSchema),
//     });

//     render(<InspectionForm {...defaultProps} form={form} />);

//     const submitButton = screen.getByRole('button', { name: /save inspection/i });
//     await userEvent.click(submitButton);

//     // Wait for validation messages
//     await waitFor(() => {
//       expect(screen.getByText(/client is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/inspection date is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/location is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/inspector is required/i)).toBeInTheDocument();
//     });
//   });

//   it('pre-fills form fields in edit mode', () => {
//     const mockInspection = {
//       client_id: '1',
//       inspection_date: '2024-03-15',
//       location: 'Test Location',
//       inspector: 'John Doe',
//       status: 'completed',
//       notes: 'Test notes',
//       cover_page: true,
//     };

//     mockForm.getValues.mockReturnValue(mockInspection);

//     render(<InspectionForm {...defaultProps} isEdit={true} />);

//     expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
//   });
// });
