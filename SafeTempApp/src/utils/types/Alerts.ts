export interface Alert {
  id: number;
  user_id: number;
  temperatura_min: number | null;
  temperatura_max: number | null;
  hora_inicio: string;
  hora_fim: string;
  criado_em: string;
  ativo: boolean;
  notificacaoAtiva: boolean;
}
