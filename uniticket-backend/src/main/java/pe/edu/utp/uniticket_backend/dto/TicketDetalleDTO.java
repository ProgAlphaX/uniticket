package pe.edu.utp.uniticket_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TicketDetalleDTO(
        Long nId_Ticket,
        String sNum_Ticket,
        Long nId_Usuario,
        String sTipo,
        String sAsunto,
        String sDescripcion,
        String sEstado,
        LocalDateTime dFecha_Creacion,
        LocalDateTime dFecha_Actualizacion,
        List<SeguimientoDTO> seguimiento
) {
}
