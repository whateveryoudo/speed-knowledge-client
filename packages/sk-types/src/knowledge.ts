export interface KnowledgeItem {
  id: string;
  user_id: number;
  group_id: number;
  icon: string;
  name: string;
  slug: string;
  description: string;
  cover_url: string;
  is_public: boolean;
  items_count: number;
  content_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeGroupItem {
  id: string;
  user_id: number;
  group_name: string;
  order_index: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
