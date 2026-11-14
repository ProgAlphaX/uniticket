package pe.edu.utp.uniticket_backend.dto;

public record UsuarioDTO(
        Long nId_Usuario,
        String sNombres,
        String sApellidos,
        String sNombreCompleto,
        String sEmail,
        String sDni,
        String sTelefono,
        String sRol,
        String sEstado
) {
}
