package pe.edu.utp.uniticket_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.utp.uniticket_backend.model.Seguimiento;
import pe.edu.utp.uniticket_backend.model.Ticket;

public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {

    List<Seguimiento> findByTicket(Ticket ticket);
}
