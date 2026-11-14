package pe.edu.utp.uniticket_backend.dto;

import java.time.LocalDateTime;

public record SeguimientoDTO(
        Long nId_Seguimiento,
        Long nId_Usuario,
        String sNombreUsuario,
        String sAccion,
        String sComentario,
        LocalDateTime dFecha
) {
}
