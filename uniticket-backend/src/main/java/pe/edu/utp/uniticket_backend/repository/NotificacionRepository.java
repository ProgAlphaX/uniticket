package pe.edu.utp.uniticket_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.utp.uniticket_backend.model.Notificacion;
import pe.edu.utp.uniticket_backend.model.Usuario;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuario(Usuario usuario);
}
