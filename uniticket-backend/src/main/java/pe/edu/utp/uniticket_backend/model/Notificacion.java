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
@Table(name = "notificacion")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nid_notificacion")
    private Long nId_Notificacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nid_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nid_ticket", nullable = false)
    private Ticket ticket;

    @Column(name = "stipo", nullable = false, length = 20)
    private String sTipo;

    @Column(name = "smensaje", nullable = false, length = 200)
    private String sMensaje;

    @Column(name = "bleida", nullable = false)
    private Boolean bLeida;

    @Column(name = "dfecha", nullable = false)
    private LocalDateTime dFecha;

    public Notificacion() {
    }

    public Notificacion(Usuario usuario, Ticket ticket, String sTipo, String sMensaje) {
        this.usuario = usuario;
        this.ticket = ticket;
        this.sTipo = sTipo;
        this.sMensaje = sMensaje;
        this.bLeida = false;
        this.dFecha = LocalDateTime.now();
    }

    public Long getNId_Notificacion() {
        return nId_Notificacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public String getSTipo() {
        return sTipo;
    }

    public String getSMensaje() {
        return sMensaje;
    }

    public Boolean getBLeida() {
        return bLeida;
    }

    public void setBLeida(Boolean bLeida) {
        this.bLeida = bLeida;
    }

    public LocalDateTime getDFecha() {
        return dFecha;
    }
}
