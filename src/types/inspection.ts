export interface InspectionItem {
  id?: string;
  inspection_id?: string;
  item_type: string;
  floor: string;
  room: string;
  equipment_type: string;
  status: 'pass' | 'fail' | 'no-access';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Inspection {
  id?: string;
  client_id: string;
  inspection_date: string;
  location: string;
  inspector: string;
  status: 'scheduled' | 'completed' | 'failed';
  notes?: string;
  cover_page: boolean;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: string;
    name: string;
    point_of_contact?: string;
    inspection_types?: string[];
    frequency?: string;
  };
  inspection_items?: InspectionItem[];
}

export interface InspectionFormData {
  client_id: string;
  inspection_date: string;
  location: string;
  inspector: string;
  status: 'scheduled' | 'completed' | 'failed';
  notes?: string;
  cover_page: boolean;
  items: InspectionItem[];
}