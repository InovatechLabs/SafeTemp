export const formatHour = (iso: string) => {
  const date = new Date(iso);

  date.setHours(date.getHours() + 3);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};