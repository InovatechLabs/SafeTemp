export const formatHour = (iso: string) => {
  const date = new Date(iso);

  date.setHours(date.getHours() + 3);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatDateForAPI = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const formatUTCtoBRT = (utcDateString: string | Date) => {
  if (!utcDateString) return "";

  const date = new Date(utcDateString);

  const brtDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const dia = String(brtDate.getUTCDate()).padStart(2, '0');
  const mes = String(brtDate.getUTCMonth() + 1).padStart(2, '0');
  const ano = brtDate.getUTCFullYear();
  const horas = String(brtDate.getUTCHours()).padStart(2, '0');
  const minutos = String(brtDate.getUTCMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
};