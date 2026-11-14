package pe.edu.utp.uniticket_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.utp.uniticket_backend.dto.ComentarioDTO;
import pe.edu.utp.uniticket_backend.dto.TicketCreateDTO;
import pe.edu.utp.uniticket_backend.dto.TicketDTO;
import pe.edu.utp.uniticket_backend.dto.TicketDetalleDTO;
import pe.edu.utp.uniticket_backend.dto.TicketEstadoDTO;
import pe.edu.utp.uniticket_backend.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /* 1° Rest: Crear Ticket */
    @PostMapping
    public ResponseEntity<TicketDTO> crearTicket(@Valid @RequestBody TicketCreateDTO datos) {
        TicketDTO ticketCreado = ticketService.crearTicket(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketCreado);
    }

    /* 2° Rest: Listar Tickets */
    @GetMapping
    public ResponseEntity<List<TicketDTO>> listarTickets(
            @RequestParam(name = "estado", required = false) String estado,
            @RequestParam(name = "tipo", required = false) String tipo) {
        return ResponseEntity.ok(ticketService.listarTickets(estado, tipo));
    }

    /* 3° Rest: Obtener Ticket por ID con su seguimiento */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDetalleDTO> obtenerTicketPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ticketService.obtenerTicketPorId(id));
    }

    /* 4° Rest: Cambiar estado (atender, observar, procede, no procede) */
    @PutMapping("/{id}/estado")
    public ResponseEntity<TicketDetalleDTO> cambiarEstado(
            @PathVariable("id") Long id,
            @Valid @RequestBody TicketEstadoDTO datos) {
        return ResponseEntity.ok(ticketService.cambiarEstado(id, datos));
    }

    /* 5° Rest: El estudiante responde una observación */
    @PostMapping("/{id}/comentarios")
    public ResponseEntity<TicketDetalleDTO> responderObservacion(
            @PathVariable("id") Long id,
            @Valid @RequestBody ComentarioDTO datos) {
        return ResponseEntity.ok(ticketService.responderObservacion(id, datos));
    }
}
