export interface DataItem {
  id: number;
  chipId: string;
  value: string;
  timestamp: string;
};

export interface DataItemArray {
  records: DataItem[];
}