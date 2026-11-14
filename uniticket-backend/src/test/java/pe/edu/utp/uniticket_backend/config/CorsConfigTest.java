package pe.edu.utp.uniticket_backend.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest
@AutoConfigureMockMvc
class CorsConfigTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void testPreflightDesdeAngularEsPermitido() throws Exception {
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.options("/api/tickets")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("http://localhost:4200", result.getResponse().getHeader("Access-Control-Allow-Origin"));
    }

    @Test
    void testPreflightDesdeOrigenDesconocidoEsRechazado() throws Exception {
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.options("/api/tickets")
                        .header("Origin", "http://sitio-malicioso.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andReturn();
        assertEquals(HttpStatus.FORBIDDEN.value(), result.getResponse().getStatus());
        assertNull(result.getResponse().getHeader("Access-Control-Allow-Origin"));
    }
}
