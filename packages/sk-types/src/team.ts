export interface TeamItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  visibility: string;
  owner_id: number;
  space_id: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}