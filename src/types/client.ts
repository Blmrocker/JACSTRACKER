import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  point_of_contact: z.string().optional().nullable(),
  inspection_types: z.array(z.string().optional()),
  frequency: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  street_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  notes: z.string().optional().nullable(),
  contract_start: z.string().optional().nullable(),
  contract_end: z.string().optional().nullable(),
  contract_amount: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      }),
      z.null(),
    ])
    .optional()
    .nullable(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export interface Client extends ClientFormData {
  id: string;
  created_at: string;
}
