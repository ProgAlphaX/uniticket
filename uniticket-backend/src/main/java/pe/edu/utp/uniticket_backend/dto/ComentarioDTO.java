package pe.edu.utp.uniticket_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioDTO(
        @NotBlank(message = "El comentario es obligatorio")
        @Size(max = 1000, message = "El comentario no puede superar 1000 caracteres")
        String sComentario
) {
}
