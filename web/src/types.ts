export type StatusValue = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
export type ServiceValue = 'website' | 'web-app' | 'integration' | 'maintenance';
export type SortValue = 'newest' | 'oldest' | 'name';

export interface Intake {
  id: number;
  clientName: string;
  email: string;
  company: string;
  service: ServiceValue;
  message: string;
  status: StatusValue;
  nextStatuses: StatusValue[];
  createdAt: string;
  updatedAt: string;
}

export interface IntakeList {
  items: Intake[];
  total: number;
  counts: Record<StatusValue, number>;
}

export interface IntakeFields {
  clientName: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export interface ListQuery {
  status: StatusValue | '';
  q: string;
  sort: SortValue;
}

export type FieldErrors = Partial<Record<keyof IntakeFields | 'status' | '_', string>>;
