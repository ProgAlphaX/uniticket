import { Ticket, TicketDetalle } from '../../core/models/ticket';
import { Usuario } from '../../core/models/usuario';

export const ESTUDIANTE: Usuario = {
  nId_Usuario: 2, sNombres: 'Ana', sApellidos: 'Torres Quispe', sNombreCompleto: 'Ana Torres Quispe',
  sEmail: 'ana.torres@utp.edu.pe', sDni: '72345678', sTelefono: null, sRol: 'ESTANDAR', sEstado: 'ACTIVO',
};

export const ADMIN: Usuario = {
  nId_Usuario: 1, sNombres: 'Julio', sApellidos: 'Admin', sNombreCompleto: 'Julio Admin',
  sEmail: 'julio.admin@utp.edu.pe', sDni: '70123456', sTelefono: null, sRol: 'ADMIN', sEstado: 'ACTIVO',
};

const ticket = (id: number, usuario: number, estado: Ticket['sEstado'], tipo: Ticket['sTipo'], asunto: string): Ticket => ({
  nId_Ticket: id,
  sNum_Ticket: `SOL-${String(id).padStart(4, '0')}`,
  nId_Usuario: usuario,
  sTipo: tipo,
  sAsunto: asunto,
  sDescripcion: 'Descripción de prueba con más de veinte caracteres',
  sEstado: estado,
  dFecha_Creacion: `2026-11-1${id}T10:00:00`,
  dFecha_Actualizacion: `2026-11-1${id}T12:00:00`,
});

export const TICKETS: Ticket[] = [
  ticket(1, 2, 'PENDIENTE', 'CERTIFICADO', 'Constancia de matrícula'),
  ticket(2, 2, 'OBSERVADO', 'PENSION', 'Pago duplicado'),
  ticket(3, 5, 'PENDIENTE', 'CERTIFICADO', 'Certificado de notas'),
  ticket(4, 5, 'PROCEDE', 'DOCUMENTOS', 'Duplicado de carné'),
];

export function detalle(base: Ticket, acciones: TicketDetalle['seguimiento'][number]['sAccion'][] = ['REGISTRO']): TicketDetalle {
  return {
    ...base,
    seguimiento: acciones.map((sAccion, i) => ({
      nId_Seguimiento: i + 1,
      nId_Usuario: sAccion === 'REGISTRO' || sAccion === 'RESPUESTA' ? base.nId_Usuario : ADMIN.nId_Usuario,
      sNombreUsuario: sAccion === 'REGISTRO' || sAccion === 'RESPUESTA' ? 'Ana Torres Quispe' : 'Julio Admin',
      sAccion,
      sComentario: sAccion === 'REGISTRO' || sAccion === 'EN_PROCESO' ? null : 'Comentario de prueba',
      dFecha: base.dFecha_Creacion,
    })),
  };
}
