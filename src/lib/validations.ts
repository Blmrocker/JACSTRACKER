import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  logo_url: z.string().optional(),
  notifications: z
    .object({
      renewals: z.boolean().default(false).optional(),
      inspections: z.boolean().default(false).optional(),
      failures: z.boolean().default(false).optional(),
      users: z.boolean().default(false).optional(),
    })
    .optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

export const userSchema = z.object({
  email: z.string().email('Invalid email address').optional().nullable(),
  role: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  notify_renewals: z.boolean().optional(),
  notify_inspections: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

const inspectionItemSchema = z.object({
  item_type: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  equipment_type: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export const inspectionSchema = z.object({
  client_id: z.string(),
  inspection_date: z.string().optional(),
  location: z.string().optional(),
  inspector: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  cover_page: z.boolean().optional(),
  items: z.array(inspectionItemSchema).optional(),
});

export type InspectionFormData = z.infer<typeof inspectionSchema>;
