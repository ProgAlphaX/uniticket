package pe.edu.utp.uniticket_backend.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class LoginAttemptServiceTest {

    @Test
    void testSeBloqueaTrasCincoFallos() {
        LoginAttemptService service = new LoginAttemptService();
        for (int i = 0; i < 4; i++) {
            service.registrarFallo("a@utp.edu.pe", "1.1.1.1");
        }
        assertDoesNotThrow(() -> service.verificarNoBloqueado("a@utp.edu.pe", "1.1.1.1"));
        service.registrarFallo("a@utp.edu.pe", "1.1.1.1");
        assertThrows(ResponseStatusException.class, () -> service.verificarNoBloqueado("A@utp.edu.pe", "1.1.1.1"));
        assertDoesNotThrow(() -> service.verificarNoBloqueado("a@utp.edu.pe", "2.2.2.2"));
    }

    @Test
    void testUnLoginCorrectoReiniciaElContador() {
        LoginAttemptService service = new LoginAttemptService();
        for (int i = 0; i < 4; i++) {
            service.registrarFallo("b@utp.edu.pe", "1.1.1.1");
        }
        service.registrarExito("b@utp.edu.pe", "1.1.1.1");
        service.registrarFallo("b@utp.edu.pe", "1.1.1.1");
        assertDoesNotThrow(() -> service.verificarNoBloqueado("b@utp.edu.pe", "1.1.1.1"));
    }
}
