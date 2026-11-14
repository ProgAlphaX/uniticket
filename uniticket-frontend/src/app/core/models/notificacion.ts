export type TipoNotificacion = 'NUEVO' | 'RESPUESTA' | 'EN_PROCESO' | 'OBSERVADO' | 'PROCEDE' | 'NO_PROCEDE';

export interface Notificacion {
  nId_Notificacion: number;
  nId_Ticket: number;
  sNum_Ticket: string;
  sAsunto: string;
  sTipo: TipoNotificacion;
  sMensaje: string;
  bLeida: boolean;
  dFecha: string;
}
