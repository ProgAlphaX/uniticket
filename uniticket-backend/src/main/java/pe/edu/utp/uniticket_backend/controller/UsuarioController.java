package pe.edu.utp.uniticket_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.utp.uniticket_backend.dto.UsuarioCreateDTO;
import pe.edu.utp.uniticket_backend.dto.UsuarioDTO;
import pe.edu.utp.uniticket_backend.dto.UsuarioEstadoDTO;
import pe.edu.utp.uniticket_backend.dto.UsuarioUpdateDTO;
import pe.edu.utp.uniticket_backend.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /* Perfil del usuario autenticado */
    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> miPerfil(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.obtenerPorEmail(authentication.getName()));
    }

    /* 1° Rest: Listar Usuarios */
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios(
            @RequestParam(name = "estado", required = false) String estado) {
        List<UsuarioDTO> usuarios = usuarioService.listarUsuarios(estado);
        return ResponseEntity.ok(usuarios);
    }

    /* 2° Rest: Buscar Usuario por Nombre */
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/buscar")
    public ResponseEntity<List<UsuarioDTO>> buscarPorNombre(
            @RequestParam(name = "nombre") String nombre) {
        List<UsuarioDTO> usuarios = usuarioService.buscarPorNombre(nombre);
        return ResponseEntity.ok(usuarios);
    }

    /* 3° Rest: Crear Usuario */
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<UsuarioDTO> crearUsuario(@Valid @RequestBody UsuarioCreateDTO datos) {
        UsuarioDTO usuarioCreado = usuarioService.crearUsuario(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCreado);
    }

    /* 4° Rest: Actualizar Usuario */
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(
            @PathVariable("id") Long id,
            @Valid @RequestBody UsuarioUpdateDTO datos) {
        UsuarioDTO usuarioActualizado = usuarioService.actualizarUsuario(id, datos);
        return ResponseEntity.ok(usuarioActualizado);
    }

    /* 5° Rest: Activar o desactivar Usuario */
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}/estado")
    public ResponseEntity<UsuarioDTO> cambiarEstado(
            @PathVariable("id") Long id,
            @Valid @RequestBody UsuarioEstadoDTO datos,
            Authentication authentication) {
        UsuarioDTO usuario = usuarioService.cambiarEstado(id, datos.sEstado(), authentication.getName());
        return ResponseEntity.ok(usuario);
    }
}
