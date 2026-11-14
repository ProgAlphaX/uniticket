package pe.edu.utp.uniticket_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.utp.uniticket_backend.dto.NotificacionDTO;
import pe.edu.utp.uniticket_backend.service.NotificacionService;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    /* 1° Rest: Notificaciones del usuario autenticado */
    @GetMapping
    public ResponseEntity<List<NotificacionDTO>> listar(Authentication authentication) {
        return ResponseEntity.ok(notificacionService.listar(authentication.getName()));
    }

    /* 2° Rest: Marcar una notificación como leída */
    @PutMapping("/{id}/leida")
    public ResponseEntity<Void> marcarLeida(@PathVariable("id") Long id, Authentication authentication) {
        notificacionService.marcarLeida(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /* 3° Rest: Marcar todas como leídas */
    @PutMapping("/leidas")
    public ResponseEntity<Void> marcarTodas(Authentication authentication) {
        notificacionService.marcarTodas(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
