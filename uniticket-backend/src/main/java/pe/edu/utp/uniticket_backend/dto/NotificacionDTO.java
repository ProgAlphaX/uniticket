package pe.edu.utp.uniticket_backend.dto;

import java.time.LocalDateTime;

public record NotificacionDTO(
        Long nId_Notificacion,
        Long nId_Ticket,
        String sNum_Ticket,
        String sAsunto,
        String sTipo,
        String sMensaje,
        Boolean bLeida,
        LocalDateTime dFecha
) {
}
