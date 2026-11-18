package pe.edu.utp.uniticket_backend.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_INTENTOS = 5;
    private static final Duration BLOQUEO = Duration.ofMinutes(15);
    private static final int LIMITE_ENTRADAS = 10_000;

    private record Registro(int intentos, Instant bloqueadoHasta) {
    }

    private final ConcurrentHashMap<String, Registro> registros = new ConcurrentHashMap<>();

    public void verificarNoBloqueado(String email, String ip) {
        Registro registro = registros.get(clave(email, ip));
        if (registro != null && registro.bloqueadoHasta() != null && registro.bloqueadoHasta().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos");
        }
    }

    public void registrarFallo(String email, String ip) {
        if (registros.size() > LIMITE_ENTRADAS) {
            Instant ahora = Instant.now();
            registros.values().removeIf(r -> r.bloqueadoHasta() == null || r.bloqueadoHasta().isBefore(ahora));
        }
        registros.merge(clave(email, ip), new Registro(1, null), (actual, nuevo) -> {
            if (actual.bloqueadoHasta() != null && actual.bloqueadoHasta().isBefore(Instant.now())) {
                return nuevo;
            }
            int intentos = actual.intentos() + 1;
            return new Registro(intentos, intentos >= MAX_INTENTOS ? Instant.now().plus(BLOQUEO) : null);
        });
    }

    public void registrarExito(String email, String ip) {
        registros.remove(clave(email, ip));
    }

    private String clave(String email, String ip) {
        return email.trim().toLowerCase() + "|" + ip;
    }
}
