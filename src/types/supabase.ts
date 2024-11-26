export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          point_of_contact: string | null;
          inspection_types: string[] | null;
          frequency: string | null;
          phone: string | null;
          street_address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          email: string | null;
          notes: string | null;
          contract_start: string | null;
          contract_end: string | null;
          contract_amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          point_of_contact?: string | null;
          inspection_types?: string[] | null;
          frequency?: string | null;
          phone?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          email?: string | null;
          notes?: string | null;
          contract_start?: string | null;
          contract_end?: string | null;
          contract_amount?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          point_of_contact?: string | null;
          inspection_types?: string[] | null;
          frequency?: string | null;
          phone?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          email?: string | null;
          notes?: string | null;
          contract_start?: string | null;
          contract_end?: string | null;
          contract_amount?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
