import { CollaboratorResourceType } from './collaborator'

export interface ResourceAccessBase {
  target_id: string
  target_type: CollaboratorResourceType
}

export interface ResourceAccessCreate extends ResourceAccessBase {
  password: string
}

export interface ResourceAccessUpdate {
  password: string
}

export interface ResourceAccessItem extends ResourceAccessBase {
  id: string
  password: string | null
  created_at: string
  updated_at: string
}
