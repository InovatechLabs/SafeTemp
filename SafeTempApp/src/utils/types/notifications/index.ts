export interface Notification {
  id: number;
  user_id: number;
  alert_id?: number | null;
  title: string;
  content: string;
  sent_at: string; 
  read: boolean;   
}