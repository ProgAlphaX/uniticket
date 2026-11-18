import { EstadoTicket, TipoTicket } from '../config/catalogos';
import { Seguimiento } from './seguimiento';

export interface Ticket {
  nId_Ticket: number;
  sNum_Ticket: string;
  nId_Usuario: number;
  sTipo: TipoTicket;
  sAsunto: string;
  sDescripcion: string;
  sEstado: EstadoTicket;
  dFecha_Creacion: string;
  dFecha_Actualizacion: string;
}

export interface TicketDetalle extends Ticket {
  seguimiento: Seguimiento[];
}

export interface TicketCreate {
  sTipo: TipoTicket;
  sAsunto: string;
  sDescripcion: string;
}

export interface TicketEstado {
  sEstado: Exclude<EstadoTicket, 'PENDIENTE'>;
  sComentario: string | null;
}

export interface Comentario {
  sComentario: string;
}
