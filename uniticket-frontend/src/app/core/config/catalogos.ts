export type TipoTicket = 'CERTIFICADO' | 'CITA_TUTOR' | 'PENSION' | 'DOCUMENTOS';
export type EstadoTicket = 'PENDIENTE' | 'EN_PROCESO' | 'OBSERVADO' | 'PROCEDE' | 'NO_PROCEDE';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type RolUsuario = 'ADMIN' | 'ESTANDAR';

/** Máximo de observaciones permitidas por solicitud (misma regla que el backend). */
export const MAX_OBSERVACIONES = 2;

export const TIPOS: Record<TipoTicket, string> = {
  CERTIFICADO: 'Certificado de estudios',
  CITA_TUTOR: 'Cita con tutor',
  PENSION: 'Pensión y pagos',
  DOCUMENTOS: 'Trámite de documentos',
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
