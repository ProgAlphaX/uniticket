package pe.edu.utp.uniticket_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ComentarioDTO(
        @NotNull(message = "El id del usuario es obligatorio")
        Long nId_Usuario,

        @NotBlank(message = "El comentario es obligatorio")
        @Size(max = 1000, message = "El comentario no puede superar 1000 caracteres")
        String sComentario
) {
}
