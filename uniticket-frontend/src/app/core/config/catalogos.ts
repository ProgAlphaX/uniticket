export type TipoTicket = 'CERTIFICADO' | 'CITA_TUTOR' | 'PENSION' | 'DOCUMENTOS';
export type EstadoTicket = 'PENDIENTE' | 'EN_PROCESO' | 'OBSERVADO' | 'PROCEDE' | 'NO_PROCEDE';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type RolUsuario = 'ADMIN' | 'ESTANDAR';

export const MAX_OBSERVACIONES = 2;

export const TIPOS: Record<TipoTicket, string> = {
  CERTIFICADO: 'Certificado de estudios',
  CITA_TUTOR: 'Cita con tutor',
  PENSION: 'Pensión y pagos',
  DOCUMENTOS: 'Trámite de documentos',
};

export const TIPO_DESCRIPCION: Record<TipoTicket, string> = {
  CERTIFICADO: 'Constancias y certificados de notas',
  CITA_TUTOR: 'Asesoría académica o de tesis',
  PENSION: 'Cuotas, boletas, fraccionamiento',
  DOCUMENTOS: 'Carné, convalidaciones, datos',
};

export const TIPO_ICONO: Record<TipoTicket, string> = {
  CERTIFICADO: 'workspace_premium',
  CITA_TUTOR: 'event',
  PENSION: 'payments',
  DOCUMENTOS: 'folder',
};

export const ESTADO_ICONO: Record<EstadoTicket, string> = {
  PENDIENTE: 'schedule',
  EN_PROCESO: 'play_circle',
  OBSERVADO: 'flag',
  PROCEDE: 'check_circle',
  NO_PROCEDE: 'cancel',
};

export const ESTADO_COLOR: Record<EstadoTicket, string> = {
  PENDIENTE: '#F08C00',
  EN_PROCESO: '#3B63F0',
  OBSERVADO: '#9B4DDB',
  PROCEDE: '#1F9D57',
  NO_PROCEDE: '#E5484D',
};

export const TIPO_COLOR: Record<TipoTicket, string> = {
  CERTIFICADO: '#3B4FD8',
  CITA_TUTOR: '#0E9F8E',
  PENSION: '#E58A00',
  DOCUMENTOS: '#D6408B',
};

export const ESTADOS_PLURAL: Record<EstadoTicket, string> = {
  PENDIENTE: 'Pendientes',
  EN_PROCESO: 'En proceso',
  OBSERVADO: 'Observadas',
  PROCEDE: 'Procede',
  NO_PROCEDE: 'No procede',
};

export const ESTADOS: Record<EstadoTicket, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  OBSERVADO: 'Observado',
  PROCEDE: 'Procede',
  NO_PROCEDE: 'No procede',
};

export const ESTADOS_USUARIO: Record<EstadoUsuario, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
};

export const ROLES: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  ESTANDAR: 'Estudiante',
};
