package pe.edu.utp.uniticket_backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "seguimiento")
public class Seguimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nid_seguimiento")
    private Long nId_Seguimiento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nid_ticket", nullable = false)
    private Ticket ticket;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nid_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "saccion", nullable = false, length = 20)
    private String sAccion;

    @Column(name = "scomentario", length = 1000)
    private String sComentario;

    @Column(name = "dfecha", nullable = false)
    private LocalDateTime dFecha;

    public Seguimiento() {
    }

    public Seguimiento(Ticket ticket, Usuario usuario, String sAccion, String sComentario) {
        this.ticket = ticket;
        this.usuario = usuario;
        this.sAccion = sAccion;
        this.sComentario = sComentario;
        this.dFecha = LocalDateTime.now();
    }

    public Long getNId_Seguimiento() {
        return nId_Seguimiento;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getSAccion() {
        return sAccion;
    }

    public String getSComentario() {
        return sComentario;
    }

    public LocalDateTime getDFecha() {
        return dFecha;
    }
}
