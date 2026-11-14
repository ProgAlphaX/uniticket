package pe.edu.utp.uniticket_backend.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.utp.uniticket_backend.dto.ComentarioDTO;
import pe.edu.utp.uniticket_backend.dto.SeguimientoDTO;
import pe.edu.utp.uniticket_backend.dto.TicketCreateDTO;
import pe.edu.utp.uniticket_backend.dto.TicketDTO;
import pe.edu.utp.uniticket_backend.dto.TicketDetalleDTO;
import pe.edu.utp.uniticket_backend.dto.TicketEstadoDTO;
import pe.edu.utp.uniticket_backend.exception.ResourceNotFoundException;
import pe.edu.utp.uniticket_backend.model.Seguimiento;
import pe.edu.utp.uniticket_backend.model.Ticket;
import pe.edu.utp.uniticket_backend.model.Usuario;
import pe.edu.utp.uniticket_backend.repository.SeguimientoRepository;
import pe.edu.utp.uniticket_backend.repository.TicketRepository;
import pe.edu.utp.uniticket_backend.repository.UsuarioRepository;

@Service
public class TicketService {

    public static final int MAX_OBSERVACIONES = 2;

    private static final String PENDIENTE = "PENDIENTE";
    private static final String EN_PROCESO = "EN_PROCESO";
    private static final String OBSERVADO = "OBSERVADO";
    private static final String PROCEDE = "PROCEDE";
    private static final String NO_PROCEDE = "NO_PROCEDE";
    private static final String ROL_ADMIN = "ADMIN";

    private static final List<String> ESTADOS_VALIDOS = List.of(PENDIENTE, EN_PROCESO, OBSERVADO, PROCEDE, NO_PROCEDE);
    private static final List<String> TIPOS_VALIDOS = List.of("CERTIFICADO", "CITA_TUTOR", "PENSION", "DOCUMENTOS");

    private static final Map<String, Set<String>> TRANSICIONES = Map.of(
            PENDIENTE, Set.of(EN_PROCESO),
            EN_PROCESO, Set.of(OBSERVADO, PROCEDE, NO_PROCEDE),
            OBSERVADO, Set.of(NO_PROCEDE)
    );

    private static final Map<String, String> MENSAJES = Map.of(
            EN_PROCESO, "Tu solicitud %s está en proceso",
            OBSERVADO, "Tu solicitud %s tiene una observación",
            PROCEDE, "Tu solicitud %s procede",
            NO_PROCEDE, "Tu solicitud %s no procede"
    );

    private final TicketRepository ticketRepository;
    private final SeguimientoRepository seguimientoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;

    public TicketService(TicketRepository ticketRepository, SeguimientoRepository seguimientoRepository,
                         UsuarioRepository usuarioRepository, NotificacionService notificacionService) {
        this.ticketRepository = ticketRepository;
        this.seguimientoRepository = seguimientoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionService = notificacionService;
    }

    @Transactional
    public TicketDTO crearTicket(TicketCreateDTO datos) {
        Usuario usuario = buscarUsuario(datos.nId_Usuario(), "Usuario");
        if (!TIPOS_VALIDOS.contains(datos.sTipo().toUpperCase())) {
            throw new IllegalArgumentException("Tipo de ticket no válido: " + datos.sTipo());
        }
        LocalDateTime ahora = LocalDateTime.now();
        Ticket ticket = new Ticket(null, null, usuario.getNId_Usuario(), datos.sTipo().toUpperCase(),
                datos.sAsunto().trim(), datos.sDescripcion().trim(), PENDIENTE, ahora);
        ticket.setDFecha_Actualizacion(ahora);
        Ticket guardado = ticketRepository.save(ticket);
        guardado.setSNum_Ticket(String.format("SOL-%04d", guardado.getNId_Ticket()));
        guardado = ticketRepository.save(guardado);

        seguimientoRepository.save(new Seguimiento(guardado, usuario, "REGISTRO", null));
        notificacionService.notificarAdmins(guardado, "NUEVO",
                "Nueva solicitud " + guardado.getSNum_Ticket() + " de " + nombreCorto(usuario));
        return mapearADTO(guardado);
    }

    public List<TicketDTO> listarTickets(String estado, String tipo) {
        if (estado != null && !ESTADOS_VALIDOS.contains(estado.toUpperCase())) {
            throw new IllegalArgumentException("Estado no válido: " + estado);
        }
        if (tipo != null && !TIPOS_VALIDOS.contains(tipo.toUpperCase())) {
            throw new IllegalArgumentException("Tipo de ticket no válido: " + tipo);
        }
        return ticketRepository.findAll().stream()
                .filter(t -> estado == null || t.getSEstado().equalsIgnoreCase(estado))
                .filter(t -> tipo == null || t.getSTipo().equalsIgnoreCase(tipo))
                .sorted(Comparator.comparing(Ticket::getDFecha_Creacion).reversed())
                .map(this::mapearADTO)
                .toList();
    }

    public TicketDetalleDTO obtenerTicketPorId(Long id) {
        return mapearADetalleDTO(buscarTicket(id));
    }

    @Transactional
    public TicketDetalleDTO cambiarEstado(Long id, TicketEstadoDTO datos) {
        Ticket ticket = buscarTicket(id);
        Usuario admin = buscarUsuario(datos.nId_Admin(), "Administrador");
        if (!ROL_ADMIN.equals(admin.getSRol())) {
            throw new IllegalArgumentException("El usuario indicado no es administrador");
        }
        String nuevoEstado = datos.sEstado().toUpperCase();
        if (!TRANSICIONES.getOrDefault(ticket.getSEstado(), Set.of()).contains(nuevoEstado)) {
            throw new IllegalArgumentException("No se puede pasar de " + ticket.getSEstado() + " a " + nuevoEstado);
        }
        String comentario = datos.sComentario() == null ? null : datos.sComentario().trim();
        if (!EN_PROCESO.equals(nuevoEstado) && (comentario == null || comentario.isEmpty())) {
            throw new IllegalArgumentException("El comentario es obligatorio para " + nuevoEstado);
        }
        if (OBSERVADO.equals(nuevoEstado) && contarObservaciones(ticket) >= MAX_OBSERVACIONES) {
            throw new IllegalArgumentException("La solicitud ya fue observada " + MAX_OBSERVACIONES
                    + " veces. Debe declararse PROCEDE o NO_PROCEDE");
        }

        ticket.setSEstado(nuevoEstado);
        ticket.setDFecha_Actualizacion(LocalDateTime.now());
        ticketRepository.save(ticket);
        seguimientoRepository.save(new Seguimiento(ticket, admin, nuevoEstado, comentario));

        Usuario estudiante = buscarUsuario(ticket.getNId_Usuario(), "Usuario");
        notificacionService.notificar(estudiante, ticket, nuevoEstado,
                String.format(MENSAJES.get(nuevoEstado), ticket.getSNum_Ticket()));
        return mapearADetalleDTO(ticket);
    }

    @Transactional
    public TicketDetalleDTO responderObservacion(Long id, ComentarioDTO datos) {
        Ticket ticket = buscarTicket(id);
        if (!OBSERVADO.equals(ticket.getSEstado()) || !ticket.getNId_Usuario().equals(datos.nId_Usuario())) {
            throw new IllegalArgumentException("Solo puedes responder una solicitud tuya que esté OBSERVADA");
        }
        Usuario estudiante = buscarUsuario(datos.nId_Usuario(), "Usuario");

        ticket.setSEstado(EN_PROCESO);
        ticket.setDFecha_Actualizacion(LocalDateTime.now());
        ticketRepository.save(ticket);
        seguimientoRepository.save(new Seguimiento(ticket, estudiante, "RESPUESTA", datos.sComentario().trim()));

        notificacionService.notificarAdmins(ticket, "RESPUESTA",
                nombreCorto(estudiante) + " respondió la observación de " + ticket.getSNum_Ticket());
        return mapearADetalleDTO(ticket);
    }

    private long contarObservaciones(Ticket ticket) {
        return seguimientoRepository.findByTicket(ticket).stream()
                .filter(s -> OBSERVADO.equals(s.getSAccion()))
                .count();
    }

    private Ticket buscarTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con ID: " + id));
    }

    private Usuario buscarUsuario(Long id, String etiqueta) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(etiqueta + " no encontrado con ID: " + id));
    }

    private String nombreCorto(Usuario usuario) {
        return usuario.getSNombres().split(" ")[0] + " " + usuario.getSApellidos().split(" ")[0];
    }

    private TicketDTO mapearADTO(Ticket t) {
        return new TicketDTO(t.getNId_Ticket(), t.getSNum_Ticket(), t.getNId_Usuario(), t.getSTipo(),
                t.getSAsunto(), t.getSDescripcion(), t.getSEstado(), t.getDFecha_Creacion(),
                t.getDFecha_Actualizacion());
    }

    private TicketDetalleDTO mapearADetalleDTO(Ticket t) {
        List<SeguimientoDTO> seguimiento = seguimientoRepository.findByTicket(t).stream()
                .sorted(Comparator.comparing(Seguimiento::getDFecha).thenComparing(Seguimiento::getNId_Seguimiento))
                .map(s -> new SeguimientoDTO(s.getNId_Seguimiento(), s.getUsuario().getNId_Usuario(),
                        s.getUsuario().getSNombreCompleto(), s.getSAccion(), s.getSComentario(), s.getDFecha()))
                .toList();
        return new TicketDetalleDTO(t.getNId_Ticket(), t.getSNum_Ticket(), t.getNId_Usuario(), t.getSTipo(),
                t.getSAsunto(), t.getSDescripcion(), t.getSEstado(), t.getDFecha_Creacion(),
                t.getDFecha_Actualizacion(), seguimiento);
    }
}
