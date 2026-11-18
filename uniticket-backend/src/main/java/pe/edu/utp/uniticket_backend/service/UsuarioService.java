package pe.edu.utp.uniticket_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import pe.edu.utp.uniticket_backend.dto.UsuarioCreateDTO;
import pe.edu.utp.uniticket_backend.dto.UsuarioDTO;
import pe.edu.utp.uniticket_backend.dto.UsuarioUpdateDTO;
import pe.edu.utp.uniticket_backend.exception.ResourceNotFoundException;
import pe.edu.utp.uniticket_backend.model.Usuario;
import pe.edu.utp.uniticket_backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private static final List<String> ESTADOS_VALIDOS = List.of("ACTIVO", "INACTIVO");
    private static final List<String> ROLES_VALIDOS = List.of("ADMIN", "ESTANDAR");
    private static final String ESTADO_ACTIVO = "ACTIVO";
    private static final String ESTADO_INACTIVO = "INACTIVO";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioDTO> listarUsuarios(String estado) {
        if (estado != null && !ESTADOS_VALIDOS.contains(estado.toUpperCase())) {
            throw new IllegalArgumentException("Estado no válido: " + estado);
        }
        List<Usuario> usuarios = estado == null
                ? usuarioRepository.findAll()
                : usuarioRepository.findBysEstado(estado.toUpperCase());
        return usuarios.stream().map(this::mapearADTO).toList();
    }

    public UsuarioDTO obtenerPorEmail(String email) {
        return usuarioRepository.findBysEmail(email)
                .map(this::mapearADTO)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<UsuarioDTO> buscarPorNombre(String nombre) {
        String texto = nombre.trim();
        return java.util.stream.Stream.concat(
                        usuarioRepository.findBysNombresContainingIgnoreCase(texto).stream(),
                        usuarioRepository.findBysApellidosContainingIgnoreCase(texto).stream())
                .distinct()
                .map(this::mapearADTO)
                .toList();
    }

    public UsuarioDTO crearUsuario(UsuarioCreateDTO datos) {
        if (!ROLES_VALIDOS.contains(datos.sRol().toUpperCase())) {
            throw new IllegalArgumentException("Rol no válido: " + datos.sRol());
        }
        validarEmailDisponible(datos.sEmail(), null);
        Usuario usuario = new Usuario(
                null,
                datos.sNombres().trim(),
                datos.sApellidos().trim(),
                datos.sEmail().trim(),
                datos.sDni(),
                datos.sTelefono(),
                passwordEncoder.encode(datos.sPassword()),
                datos.sRol().toUpperCase(),
                ESTADO_ACTIVO,
                LocalDateTime.now()
        );
        return mapearADTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioUpdateDTO datos) {
        Usuario usuario = buscar(id);
        validarEmailDisponible(datos.sEmail(), id);
        usuario.setSNombres(datos.sNombres().trim());
        usuario.setSApellidos(datos.sApellidos().trim());
        usuario.setSEmail(datos.sEmail().trim());
        usuario.setSTelefono(datos.sTelefono());
        return mapearADTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO cambiarEstado(Long id, String estado, String emailSolicitante) {
        String nuevoEstado = estado.toUpperCase();
        if (!ESTADOS_VALIDOS.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado no válido: " + estado);
        }
        Usuario usuario = buscar(id);
        if (ESTADO_INACTIVO.equals(nuevoEstado) && usuario.getSEmail().equalsIgnoreCase(emailSolicitante)) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta");
        }
        usuario.setSEstado(nuevoEstado);
        return mapearADTO(usuarioRepository.save(usuario));
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    private void validarEmailDisponible(String email, Long idActual) {
        usuarioRepository.findBysEmail(email.trim())
                .filter(existente -> !existente.getNId_Usuario().equals(idActual))
                .ifPresent(existente -> {
                    throw new IllegalArgumentException("Ya existe un usuario con el email: " + email);
                });
    }

    private UsuarioDTO mapearADTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getNId_Usuario(),
                usuario.getSNombres(),
                usuario.getSApellidos(),
                usuario.getSNombreCompleto(),
                usuario.getSEmail(),
                usuario.getSDni(),
                usuario.getSTelefono(),
                usuario.getSRol(),
                usuario.getSEstado()
        );
    }
}
