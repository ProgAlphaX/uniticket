package pe.edu.utp.uniticket_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.utp.uniticket_backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findBysEmail(String sEmail);

    List<Usuario> findBysEstado(String sEstado);

    List<Usuario> findBysNombresContainingIgnoreCase(String sNombres);

    List<Usuario> findBysApellidosContainingIgnoreCase(String sApellidos);

    List<Usuario> findBysRol(String sRol);
}
