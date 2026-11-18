package pe.edu.utp.uniticket_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketCreateDTO(
        @NotBlank(message = "El tipo de ticket es obligatorio")
        @Size(max = 20, message = "El tipo no puede superar 20 caracteres")
        String sTipo,

        @NotBlank(message = "El asunto es obligatorio")
        @Size(max = 150, message = "El asunto no puede superar 150 caracteres")
        String sAsunto,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 1000, message = "La descripción no puede superar 1000 caracteres")
        String sDescripcion
) {
}
