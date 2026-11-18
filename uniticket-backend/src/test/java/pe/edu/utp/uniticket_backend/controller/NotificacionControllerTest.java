package pe.edu.utp.uniticket_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(username = NotificacionControllerTest.EMAIL_ESTUDIANTE)
class NotificacionControllerTest {

    static final String EMAIL_ESTUDIANTE = "noti.estudiante@utp.edu.pe";
    private static final String EMAIL_ADMIN = "noti.admin@utp.edu.pe";

    @Autowired
    MockMvc mockMvc;

    private String extraerId(String body, String campo) {
        String clave = "\"" + campo + "\":";
        String desde = body.substring(body.indexOf(clave) + clave.length());
        return desde.substring(0, desde.indexOf(","));
    }

    private MvcResult enviar(MockHttpServletRequestBuilder req, String json) throws Exception {
        return mockMvc.perform(req.contentType(MediaType.APPLICATION_JSON).content(json)
                .accept(MediaType.APPLICATION_JSON)).andReturn();
    }

    private RequestPostProcessor como(String email, String rol) {
        return SecurityMockMvcRequestPostProcessors.user(email).authorities(new SimpleGrantedAuthority(rol));
    }

    private String crearUsuario(String email, String rol) throws Exception {
        String json = """
                {
                  "sNombres": "Usuario",
                  "sApellidos": "Notificaciones",
                  "sEmail": "%s",
                  "sDni": "70033344",
                  "sTelefono": "",
                  "sRol": "%s",
                  "sPassword": "clave123"
                }
                """.formatted(email, rol);
        MvcResult result = enviar(MockMvcRequestBuilders.post(new URI("/api/usuarios")).with(como("seed.admin@utp.edu.pe", "ADMIN")), json);
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        return extraerId(result.getResponse().getContentAsString(), "nId_Usuario");
    }

    /* Crea un ticket del estudiante, lo atiende y lo observa: el estudiante recibe 2 avisos */
    private String prepararTicketObservado() throws Exception {
        crearUsuario(EMAIL_ESTUDIANTE, "ESTANDAR");
        crearUsuario(EMAIL_ADMIN, "ADMIN");
        String ticket = """
                {
                  "sTipo": "PENSION",
                  "sAsunto": "Pago duplicado",
                  "sDescripcion": "El banco me cobro dos veces la cuota"
                }
                """;
        MvcResult creado = enviar(MockMvcRequestBuilders.post(new URI("/api/tickets")).with(como(EMAIL_ESTUDIANTE, "ESTANDAR")), ticket);
        String idTicket = extraerId(creado.getResponse().getContentAsString(), "nId_Ticket");
        String uri = "/api/tickets/" + idTicket + "/estado";
        enviar(MockMvcRequestBuilders.put(new URI(uri)).with(como(EMAIL_ADMIN, "ADMIN")),
                "{\"sEstado\": \"EN_PROCESO\"}");
        enviar(MockMvcRequestBuilders.put(new URI(uri)).with(como(EMAIL_ADMIN, "ADMIN")),
                "{\"sEstado\": \"OBSERVADO\", \"sComentario\": \"Adjunta el voucher\"}");
        return idTicket;
    }

    private MvcResult listar() throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.get(new URI("/api/notificaciones"))
                .accept(MediaType.APPLICATION_JSON)).andReturn();
    }

    /* 1° Test: El estudiante recibe un aviso por cada cambio de estado */
    @Test
    void testListarNotificacionesDelEstudiante() throws Exception {
        System.out.println("Ejecutando testListarNotificacionesDelEstudiante");
        prepararTicketObservado();
        MvcResult result = listar();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        String body = result.getResponse().getContentAsString();
        assertTrue(body.contains("está en proceso"));
        assertTrue(body.contains("tiene una observación"));
        assertTrue(body.contains("\"bLeida\":false"));
    }

    /* 2° Test: El administrador recibe el aviso de solicitud nueva */
    @Test
    @WithMockUser(username = EMAIL_ADMIN)
    void testAdminRecibeAvisoDeSolicitudNueva() throws Exception {
        System.out.println("Ejecutando testAdminRecibeAvisoDeSolicitudNueva");
        prepararTicketObservado();
        String body = listar().getResponse().getContentAsString();
        assertTrue(body.contains("Nueva solicitud SOL-"));
    }

    /* 3° Test: Marcar una notificación como leída */
    @Test
    void testMarcarNotificacionComoLeida() throws Exception {
        System.out.println("Ejecutando testMarcarNotificacionComoLeida");
        prepararTicketObservado();
        String idNotificacion = extraerId(listar().getResponse().getContentAsString(), "nId_Notificacion");
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.put(
                new URI("/api/notificaciones/" + idNotificacion + "/leida"))).andReturn();
        assertEquals(HttpStatus.NO_CONTENT.value(), result.getResponse().getStatus());
        assertTrue(listar().getResponse().getContentAsString().contains("\"bLeida\":true"));
    }

    /* 4° Test: Marcar como leída una notificación inexistente */
    @Test
    void testMarcarNotificacionInexistente() throws Exception {
        System.out.println("Ejecutando testMarcarNotificacionInexistente");
        crearUsuario(EMAIL_ESTUDIANTE, "ESTANDAR");
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.put(
                new URI("/api/notificaciones/999999999/leida"))).andReturn();
        assertEquals(HttpStatus.NOT_FOUND.value(), result.getResponse().getStatus());
    }

    /* 5° Test: Marcar todas como leídas */
    @Test
    void testMarcarTodasComoLeidas() throws Exception {
        System.out.println("Ejecutando testMarcarTodasComoLeidas");
        prepararTicketObservado();
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.put(new URI("/api/notificaciones/leidas"))).andReturn();
        assertEquals(HttpStatus.NO_CONTENT.value(), result.getResponse().getStatus());
        assertFalse(listar().getResponse().getContentAsString().contains("\"bLeida\":false"));
    }

    /* 6° Test: Sin autenticación no se pueden ver notificaciones */
    @Test
    @WithAnonymousUser
    void testListarSinAutenticacion() throws Exception {
        System.out.println("Ejecutando testListarSinAutenticacion");
        assertEquals(HttpStatus.UNAUTHORIZED.value(), listar().getResponse().getStatus());
    }
}
