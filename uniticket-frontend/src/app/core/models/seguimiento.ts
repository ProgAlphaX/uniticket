export type AccionSeguimiento = 'REGISTRO' | 'EN_PROCESO' | 'OBSERVADO' | 'RESPUESTA' | 'PROCEDE' | 'NO_PROCEDE';

export interface Seguimiento {
  nId_Seguimiento: number;
  nId_Usuario: number;
  sNombreUsuario: string;
  sAccion: AccionSeguimiento;
  sComentario: string | null;
  dFecha: string;
}
