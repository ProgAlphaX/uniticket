package pe.edu.utp.uniticket_backend.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.utp.uniticket_backend.dto.NotificacionDTO;
import pe.edu.utp.uniticket_backend.exception.ResourceNotFoundException;
import pe.edu.utp.uniticket_backend.model.Notificacion;
import pe.edu.utp.uniticket_backend.model.Ticket;
import pe.edu.utp.uniticket_backend.model.Usuario;
import pe.edu.utp.uniticket_backend.repository.NotificacionRepository;
import pe.edu.utp.uniticket_backend.repository.UsuarioRepository;

@Service
public class NotificacionService {

    private static final String ROL_ADMIN = "ADMIN";
    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionService(NotificacionRepository notificacionRepository, UsuarioRepository usuarioRepository) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public void notificar(Usuario destinatario, Ticket ticket, String tipo, String mensaje) {
        notificacionRepository.save(new Notificacion(destinatario, ticket, tipo, mensaje));
    }

    public void notificarAdmins(Ticket ticket, String tipo, String mensaje) {
        usuarioRepository.findBysRol(ROL_ADMIN).stream()
                .filter(admin -> ESTADO_ACTIVO.equals(admin.getSEstado()))
                .forEach(admin -> notificar(admin, ticket, tipo, mensaje));
    }

    public List<NotificacionDTO> listar(String email) {
        return notificacionRepository.findByUsuario(buscarUsuario(email)).stream()
                .sorted(Comparator.comparing(Notificacion::getDFecha)
                        .thenComparing(Notificacion::getNId_Notificacion).reversed())
                .map(this::mapearADTO)
                .toList();
    }

    @Transactional
    public void marcarLeida(Long id, String email) {
        Usuario usuario = buscarUsuario(email);
        Notificacion notificacion = notificacionRepository.findById(id)
                .filter(n -> n.getUsuario().getNId_Usuario().equals(usuario.getNId_Usuario()))
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada con ID: " + id));
        notificacion.setBLeida(true);
        notificacionRepository.save(notificacion);
    }

    @Transactional
    public void marcarTodas(String email) {
        List<Notificacion> pendientes = notificacionRepository.findByUsuario(buscarUsuario(email)).stream()
                .filter(n -> !n.getBLeida())
                .toList();
        pendientes.forEach(n -> n.setBLeida(true));
        notificacionRepository.saveAll(pendientes);
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findBysEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));
    }

    private NotificacionDTO mapearADTO(Notificacion n) {
        return new NotificacionDTO(
                n.getNId_Notificacion(),
                n.getTicket().getNId_Ticket(),
                n.getTicket().getSNum_Ticket(),
                n.getTicket().getSAsunto(),
                n.getSTipo(),
                n.getSMensaje(),
                n.getBLeida(),
                n.getDFecha()
        );
    }
}
