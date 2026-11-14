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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class TicketControllerTest {
    @Autowired
    MockMvc mockMvc;

    private static final String ID_INEXISTENTE = "999999999";

    /* Extrae el valor numérico de un campo id del JSON de respuesta */
    private String extraerId(String body, String campo) {
        String clave = "\"" + campo + "\":";
        String desdeId = body.substring(body.indexOf(clave) + clave.length());
        return desdeId.substring(0, desdeId.indexOf(","));
    }

    /* Registra en la BD un usuario de prueba con el rol indicado y devuelve su id */
    private String crearUsuarioDePrueba(String rol) throws Exception {
        String json = """
                {
                  "sNombres": "Usuario",
                  "sApellidos": "Prueba %s",
                  "sEmail": "prueba.%s@utp.edu.pe",
                  "sDni": "70011122",
                  "sTelefono": "987654321",
                  "sRol": "%s",
                  "sPassword": "clave123"
                }
                """.formatted(rol, rol.toLowerCase(), rol);
        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        return extraerId(result.getResponse().getContentAsString(), "nId_Usuario");
    }

    private String ticketValidoJson(String idUsuario) {
        return """
                {
                  "nId_Usuario": %s,
                  "sTipo": "CERTIFICADO",
                  "sAsunto": "Constancia de prueba",
                  "sDescripcion": "Necesito la constancia para un tramite bancario"
                }
                """.formatted(idUsuario);
    }

    /* Registra en la BD un ticket de prueba (con su usuario) y devuelve el id del ticket */
    private String crearTicketDePrueba() throws Exception {
        String idUsuario = crearUsuarioDePrueba("ESTANDAR");
        URI uri = new URI("/api/tickets");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(ticketValidoJson(idUsuario))
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        return extraerId(result.getResponse().getContentAsString(), "nId_Ticket");
    }

    /* 1° Test: Crear Ticket con datos válidos */
    @Test
    void testCrearTicketConDatosValidos() throws Exception {
        System.out.println("Ejecutando testCrearTicketConDatosValidos");
        String idUsuario = crearUsuarioDePrueba("ESTANDAR");
        URI uri = new URI("/api/tickets");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(ticketValidoJson(idUsuario))
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"sEstado\":\"PENDIENTE\""));
        assertTrue(result.getResponse().getContentAsString().contains("\"sNum_Ticket\":\"SOL-"));
    }

    /* 2° Test: Crear ticket con descripción vacía */
    @Test
    void testCrearTicketConDescripcionVacia() throws Exception {
        System.out.println("Ejecutando testCrearTicketConDescripcionVacia");
        String idUsuario = crearUsuarioDePrueba("ESTANDAR");
        String json = """
                {
                  "nId_Usuario": %s,
                  "sTipo": "CERTIFICADO",
                  "sAsunto": "Constancia de prueba",
                  "sDescripcion": ""
                }
                """.formatted(idUsuario);
        URI uri = new URI("/api/tickets");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 3° Test: Crear ticket sin ID de usuario */
    @Test
    void testCrearTicketSinIdUsuario() throws Exception {
        System.out.println("Ejecutando testCrearTicketSinIdUsuario");
        String json = """
                {
                  "sTipo": "CERTIFICADO",
                  "sAsunto": "Constancia de prueba",
                  "sDescripcion": "Descripcion valida"
                }
                """;
        URI uri = new URI("/api/tickets");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 4° Test: Listar tickets */
    @Test
    void testListarTickets() throws Exception {
        System.out.println("Ejecutando testListarTickets");
        String idTicket = crearTicketDePrueba();
        URI uri = new URI("/api/tickets");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"nId_Ticket\":" + idTicket + ","));
    }

    /* 5° Test: Listar tickets filtrados por estado */
    @Test
    void testListarTicketsFiltradoPorEstado() throws Exception {
        System.out.println("Ejecutando testListarTicketsFiltradoPorEstado");
        String idTicket = crearTicketDePrueba();
        URI uri = new URI("/api/tickets?estado=PENDIENTE");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"nId_Ticket\":" + idTicket + ","));
        assertFalse(result.getResponse().getContentAsString().contains("\"sEstado\":\"PROCEDE\""));
    }

    /* 6° Test: Listar tickets con estado inválido */
    @Test
    void testListarTicketsConEstadoInvalido() throws Exception {
        System.out.println("Ejecutando testListarTicketsConEstadoInvalido");
        URI uri = new URI("/api/tickets?estado=NOEXISTE");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 7° Test: Obtener ticket por ID existente */
    @Test
    void testObtenerTicketPorIdExistente() throws Exception {
        System.out.println("Ejecutando testObtenerTicketPorIdExistente");
        String idTicket = crearTicketDePrueba();
        URI uri = new URI("/api/tickets/" + idTicket);
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"nId_Ticket\":" + idTicket + ","));
        assertTrue(result.getResponse().getContentAsString().contains("Constancia de prueba"));
    }

    /* 8° Test: Obtener ticket por ID inexistente */
    @Test
    void testObtenerTicketPorIdInexistente() throws Exception {
        System.out.println("Ejecutando testObtenerTicketPorIdInexistente");
        URI uri = new URI("/api/tickets/" + ID_INEXISTENTE);
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.NOT_FOUND.value(), result.getResponse().getStatus());
    }

    /* Registra un ticket para el usuario indicado y devuelve su id */
    private String crearTicketPara(String idUsuario) throws Exception {
        MvcResult result = enviar(MockMvcRequestBuilders.post(new URI("/api/tickets")), ticketValidoJson(idUsuario));
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        return extraerId(result.getResponse().getContentAsString(), "nId_Ticket");
    }

    private MvcResult enviar(MockHttpServletRequestBuilder req, String json) throws Exception {
        return mockMvc.perform(req.contentType(MediaType.APPLICATION_JSON).content(json)
                .accept(MediaType.APPLICATION_JSON)).andReturn();
    }

    private MvcResult cambiarEstado(String idTicket, String idAdmin, String estado, String comentario) throws Exception {
        String json = """
                {
                  "nId_Admin": %s,
                  "sEstado": "%s",
                  "sComentario": %s
                }
                """.formatted(idAdmin, estado, comentario == null ? "null" : "\"" + comentario + "\"");
        return enviar(MockMvcRequestBuilders.put(new URI("/api/tickets/" + idTicket + "/estado")), json);
    }

    private MvcResult responder(String idTicket, String idUsuario, String comentario) throws Exception {
        String json = """
                {
                  "nId_Usuario": %s,
                  "sComentario": "%s"
                }
                """.formatted(idUsuario, comentario);
        return enviar(MockMvcRequestBuilders.post(new URI("/api/tickets/" + idTicket + "/comentarios")), json);
    }

    private String estadoDe(MvcResult result) throws Exception {
        String body = result.getResponse().getContentAsString();
        String desde = body.substring(body.indexOf("\"sEstado\":\"") + "\"sEstado\":\"".length());
        return desde.substring(0, desde.indexOf("\""));
    }

    /* 9° Test: El detalle incluye el seguimiento con el registro inicial */
    @Test
    void testObtenerTicketIncluyeSeguimientoDeRegistro() throws Exception {
        System.out.println("Ejecutando testObtenerTicketIncluyeSeguimientoDeRegistro");
        String idTicket = crearTicketDePrueba();
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get(new URI("/api/tickets/" + idTicket))
                .accept(MediaType.APPLICATION_JSON)).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"sAccion\":\"REGISTRO\""));
        assertTrue(result.getResponse().getContentAsString().contains("\"dFecha_Actualizacion\""));
    }

    /* 10° Test: Atender un ticket pendiente lo pasa a EN_PROCESO */
    @Test
    void testAtenderTicketPendiente() throws Exception {
        System.out.println("Ejecutando testAtenderTicketPendiente");
        String idTicket = crearTicketDePrueba();
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        MvcResult result = cambiarEstado(idTicket, idAdmin, "EN_PROCESO", null);
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("EN_PROCESO", estadoDe(result));
    }

    /* 11° Test: Un usuario sin rol ADMIN no puede cambiar el estado */
    @Test
    void testCambiarEstadoConUsuarioSinRolAdmin() throws Exception {
        System.out.println("Ejecutando testCambiarEstadoConUsuarioSinRolAdmin");
        String idEstudiante = crearUsuarioDePrueba("ESTANDAR");
        String idTicket = crearTicketPara(idEstudiante);
        MvcResult result = cambiarEstado(idTicket, idEstudiante, "EN_PROCESO", null);
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 12° Test: Cambiar estado de un ticket inexistente */
    @Test
    void testCambiarEstadoDeTicketInexistente() throws Exception {
        System.out.println("Ejecutando testCambiarEstadoDeTicketInexistente");
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        MvcResult result = cambiarEstado(ID_INEXISTENTE, idAdmin, "EN_PROCESO", null);
        assertEquals(HttpStatus.NOT_FOUND.value(), result.getResponse().getStatus());
    }

    /* 13° Test: No se puede saltar de PENDIENTE a PROCEDE */
    @Test
    void testTransicionNoPermitida() throws Exception {
        System.out.println("Ejecutando testTransicionNoPermitida");
        String idTicket = crearTicketDePrueba();
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        MvcResult result = cambiarEstado(idTicket, idAdmin, "PROCEDE", "Aprobado sin revisar");
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("No se puede pasar de PENDIENTE a PROCEDE"));
    }

    /* 14° Test: Observar exige un comentario */
    @Test
    void testObservarSinComentario() throws Exception {
        System.out.println("Ejecutando testObservarSinComentario");
        String idTicket = crearTicketDePrueba();
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        cambiarEstado(idTicket, idAdmin, "EN_PROCESO", null);
        MvcResult result = cambiarEstado(idTicket, idAdmin, "OBSERVADO", null);
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("comentario es obligatorio"));
    }

    /* 15° Test: Flujo completo observar, responder y procede */
    @Test
    void testFlujoObservarResponderYProcede() throws Exception {
        System.out.println("Ejecutando testFlujoObservarResponderYProcede");
        String idEstudiante = crearUsuarioDePrueba("ESTANDAR");
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        String idTicket = crearTicketPara(idEstudiante);

        assertEquals("EN_PROCESO", estadoDe(cambiarEstado(idTicket, idAdmin, "EN_PROCESO", null)));
        assertEquals("OBSERVADO", estadoDe(cambiarEstado(idTicket, idAdmin, "OBSERVADO", "Adjunta el voucher")));
        assertEquals("EN_PROCESO", estadoDe(responder(idTicket, idEstudiante, "Ya envie el voucher")));
        MvcResult result = cambiarEstado(idTicket, idAdmin, "PROCEDE", "Tu constancia esta lista");
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("PROCEDE", estadoDe(result));
        String body = result.getResponse().getContentAsString();
        assertTrue(body.contains("\"sAccion\":\"RESPUESTA\""));
        assertTrue(body.contains("Tu constancia esta lista"));
    }

    /* 16° Test: Solo se permiten 2 observaciones por solicitud */
    @Test
    void testMaximoDosObservaciones() throws Exception {
        System.out.println("Ejecutando testMaximoDosObservaciones");
        String idEstudiante = crearUsuarioDePrueba("ESTANDAR");
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        String idTicket = crearTicketPara(idEstudiante);
        cambiarEstado(idTicket, idAdmin, "EN_PROCESO", null);
        for (int i = 1; i <= 2; i++) {
            assertEquals("OBSERVADO", estadoDe(cambiarEstado(idTicket, idAdmin, "OBSERVADO", "Observacion " + i)));
            assertEquals("EN_PROCESO", estadoDe(responder(idTicket, idEstudiante, "Respuesta " + i)));
        }
        MvcResult result = cambiarEstado(idTicket, idAdmin, "OBSERVADO", "Tercera observacion");
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("observada 2 veces"));
        assertEquals("NO_PROCEDE", estadoDe(cambiarEstado(idTicket, idAdmin, "NO_PROCEDE", "No cumple los requisitos")));
    }

    /* 17° Test: No se puede responder una solicitud que no está observada */
    @Test
    void testResponderSolicitudNoObservada() throws Exception {
        System.out.println("Ejecutando testResponderSolicitudNoObservada");
        String idEstudiante = crearUsuarioDePrueba("ESTANDAR");
        String idTicket = crearTicketPara(idEstudiante);
        MvcResult result = responder(idTicket, idEstudiante, "Respuesta sin observacion");
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 18° Test: Otro usuario no puede responder la observación */
    @Test
    void testResponderSolicitudDeOtroUsuario() throws Exception {
        System.out.println("Ejecutando testResponderSolicitudDeOtroUsuario");
        String idEstudiante = crearUsuarioDePrueba("ESTANDAR");
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        String idTicket = crearTicketPara(idEstudiante);
        cambiarEstado(idTicket, idAdmin, "EN_PROCESO", null);
        cambiarEstado(idTicket, idAdmin, "OBSERVADO", "Falta un documento");
        MvcResult result = responder(idTicket, idAdmin, "Respondo por el estudiante");
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 19° Test: Una solicitud observada puede cerrarse como NO_PROCEDE */
    @Test
    void testNoProcedeDesdeObservado() throws Exception {
        System.out.println("Ejecutando testNoProcedeDesdeObservado");
        String idTicket = crearTicketDePrueba();
        String idAdmin = crearUsuarioDePrueba("ADMIN");
        cambiarEstado(idTicket, idAdmin, "EN_PROCESO", null);
        cambiarEstado(idTicket, idAdmin, "OBSERVADO", "Falta un documento");
        MvcResult result = cambiarEstado(idTicket, idAdmin, "NO_PROCEDE", "El estudiante no respondio");
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("NO_PROCEDE", estadoDe(result));
    }
}
