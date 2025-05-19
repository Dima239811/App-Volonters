export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string; // Формат: YYYY-MM-DD
  time: string; // Формат: HH:MM
  location: string;
  category: string;
  imageUrl: string;
  participantIds: number[];
  isUrgent: string;
  status: string;
}