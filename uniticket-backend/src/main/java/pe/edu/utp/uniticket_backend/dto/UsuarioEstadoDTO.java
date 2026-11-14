package pe.edu.utp.uniticket_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UsuarioEstadoDTO(
        @NotBlank(message = "El estado es obligatorio") String sEstado
) {
}
