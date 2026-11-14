package pe.edu.utp.uniticket_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateDTO(
        @NotBlank(message = "Los nombres son obligatorios")
        @Size(max = 80, message = "Los nombres no pueden superar 80 caracteres")
        String sNombres,

        @NotBlank(message = "Los apellidos son obligatorios")
        @Size(max = 80, message = "Los apellidos no pueden superar 80 caracteres")
        String sApellidos,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String sEmail,

        @Pattern(regexp = "^$|9[0-9]{8}", message = "El celular debe tener 9 dígitos y empezar con 9")
        String sTelefono
) {
}
