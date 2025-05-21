// models/event.model.ts
export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
  isUrgent?: boolean;
  status?: string;
  participantIds: number[];
  creatorId: number;
}