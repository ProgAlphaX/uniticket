package pe.edu.utp.uniticket_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketEstadoDTO(
        @NotNull(message = "El id del administrador es obligatorio")
        Long nId_Admin,

        @NotBlank(message = "El estado es obligatorio")
        String sEstado,

        @Size(max = 1000, message = "El comentario no puede superar 1000 caracteres")
        String sComentario
) {
}
