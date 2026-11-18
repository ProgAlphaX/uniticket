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
@WithMockUser(authorities = "ADMIN")
class UsuarioControllerTest {

    @Autowired
    MockMvc mockMvc;

    private static final String USUARIO_VALIDO_JSON = """
            {
              "sNombres": "Jorge",
              "sApellidos": "Vidal Prueba",
              "sEmail": "jorge.vidal.prueba@utp.edu.pe",
              "sDni": "70099887",
              "sTelefono": "987000111",
              "sRol": "ESTANDAR",
              "sPassword": "clave123"
            }
            """;

    /* Registra en la BD el usuario de prueba y devuelve su id (se revierte al terminar cada test) */
    private String crearUsuarioDePrueba() throws Exception {
        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(USUARIO_VALIDO_JSON)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        String body = result.getResponse().getContentAsString();
        String desdeId = body.substring(body.indexOf("\"nId_Usuario\":") + "\"nId_Usuario\":".length());
        return desdeId.substring(0, desdeId.indexOf(","));
    }

    /* 1° Test: Listar usuarios */
    @Test
    void testListarUsuarios() throws Exception {
        System.out.println("Ejecutando testListarUsuarios");
        crearUsuarioDePrueba();
        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Jorge Vidal Prueba"));
    }

    /* 2° Test: Listar usuarios filtrados por estado */
    @Test
    void testListarUsuariosFiltradoPorEstado() throws Exception {
        System.out.println("Ejecutando testListarUsuariosFiltradoPorEstado");
        crearUsuarioDePrueba();
        URI uri = new URI("/api/usuarios?estado=ACTIVO");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Jorge Vidal Prueba"));
        assertFalse(result.getResponse().getContentAsString().contains("\"sEstado\":\"INACTIVO\""));
    }

    /* 3° Test: Listar usuarios con estado inválido */
    @Test
    void testListarUsuariosConEstadoInvalido() throws Exception {
        System.out.println("Ejecutando testListarUsuariosConEstadoInvalido");
        URI uri = new URI("/api/usuarios?estado=NOEXISTE");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 4° Test: Buscar usuario por nombre con coincidencia */
    @Test
    void testBuscarPorNombreConCoincidencia() throws Exception {
        System.out.println("Ejecutando testBuscarPorNombreConCoincidencia");
        crearUsuarioDePrueba();
        URI uri = new URI("/api/usuarios/buscar?nombre=Vidal");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Jorge Vidal Prueba"));
    }

    /* 5° Test: Buscar usuario por nombre sin coincidencia */
    @Test
    void testBuscarPorNombreSinCoincidencia() throws Exception {
        System.out.println("Ejecutando testBuscarPorNombreSinCoincidencia");
        URI uri = new URI("/api/usuarios/buscar?nombre=zzzqqqxxx");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("[]", result.getResponse().getContentAsString());
    }

    /* 6° Test: Buscar usuario por nombre de forma insensible a mayúsculas */
    @Test
    void testBuscarPorNombreEsInsensibleAMayusculas() throws Exception {
        System.out.println("Ejecutando testBuscarPorNombreEsInsensibleAMayusculas");
        crearUsuarioDePrueba();
        URI uri = new URI("/api/usuarios/buscar?nombre=VIDAL");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Jorge Vidal Prueba"));
    }

    /* 7° Test: Crear usuario con datos válidos */
    @Test
    void testCrearUsuarioConDatosValidos() throws Exception {
        System.out.println("Ejecutando testCrearUsuarioConDatosValidos");
        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(USUARIO_VALIDO_JSON)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"sEstado\":\"ACTIVO\""));
    }

    /* 8° Test: Crear usuario con email inválido */
    @Test
    void testCrearUsuarioConEmailInvalido() throws Exception {
        System.out.println("Ejecutando testCrearUsuarioConEmailInvalido");
        String json = """
                {
                  "sNombres": "Jorge",
                  "sApellidos": "Vidal Prueba",
                  "sEmail": "no-es-un-email",
                  "sDni": "70099887",
                  "sTelefono": "987000111",
                  "sRol": "ESTANDAR",
                  "sPassword": "clave123"
                }
                """;
        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 9° Test: Crear usuario con rol inválido */
    @Test
    void testCrearUsuarioConRolInvalido() throws Exception {
        System.out.println("Ejecutando testCrearUsuarioConRolInvalido");
        String json = """
                {
                  "sNombres": "Jorge",
                  "sApellidos": "Vidal Prueba",
                  "sEmail": "jorge.vidal.prueba@utp.edu.pe",
                  "sDni": "70099887",
                  "sTelefono": "987000111",
                  "sRol": "SUPERADMIN",
                  "sPassword": "clave123"
                }
                """;
        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 10° Test: Actualizar nombres, apellidos, correo y celular */
    @Test
    void testActualizarUsuarioConDatosValidos() throws Exception {
        System.out.println("Ejecutando testActualizarUsuarioConDatosValidos");
        String id = crearUsuarioDePrueba();
        String json = """
                {
                  "sNombres": "Jorge Luis",
                  "sApellidos": "Vidal Actualizado",
                  "sEmail": "jorge.vidal.prueba@utp.edu.pe",
                  "sTelefono": "912345678"
                }
                """;
        MvcResult result = put("/api/usuarios/" + id, json);
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        String body = result.getResponse().getContentAsString();
        assertTrue(body.contains("\"sNombreCompleto\":\"Jorge Luis Vidal Actualizado\""));
        assertTrue(body.contains("\"sTelefono\":\"912345678\""));
        assertTrue(body.contains("\"sEstado\":\"ACTIVO\""));
    }

    /* 11° Test: Actualizar usuario inexistente */
    @Test
    void testActualizarUsuarioInexistente() throws Exception {
        System.out.println("Ejecutando testActualizarUsuarioInexistente");
        String json = """
                {
                  "sNombres": "Nombre",
                  "sApellidos": "Cualquiera",
                  "sEmail": "cualquiera@utp.edu.pe",
                  "sTelefono": ""
                }
                """;
        MvcResult result = put("/api/usuarios/999999999", json);
        assertEquals(HttpStatus.NOT_FOUND.value(), result.getResponse().getStatus());
    }

    /* 12° Test: Actualizar usuario con el correo de otro usuario */
    @Test
    void testActualizarUsuarioConEmailDeOtroUsuario() throws Exception {
        System.out.println("Ejecutando testActualizarUsuarioConEmailDeOtroUsuario");
        String id = crearUsuarioDePrueba();
        String json = """
                {
                  "sNombres": "Jorge",
                  "sApellidos": "Vidal Prueba",
                  "sEmail": "julio.admin@utp.edu.pe",
                  "sTelefono": ""
                }
                """;
        MvcResult result = put("/api/usuarios/" + id, json);
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Ya existe un usuario con el email"));
    }

    /* 13° Test: Desactivar un usuario */
    @Test
    void testDesactivarUsuario() throws Exception {
        System.out.println("Ejecutando testDesactivarUsuario");
        String id = crearUsuarioDePrueba();
        MvcResult result = put("/api/usuarios/" + id + "/estado", "{\"sEstado\": \"INACTIVO\"}");
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"sEstado\":\"INACTIVO\""));
    }

    /* 14° Test: Cambiar a un estado inválido */
    @Test
    void testCambiarEstadoInvalido() throws Exception {
        System.out.println("Ejecutando testCambiarEstadoInvalido");
        String id = crearUsuarioDePrueba();
        MvcResult result = put("/api/usuarios/" + id + "/estado", "{\"sEstado\": \"SUSPENDIDO\"}");
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    /* 15° Test: Un usuario no puede desactivar su propia cuenta */
    @Test
    @WithMockUser(username = "jorge.vidal.prueba@utp.edu.pe", authorities = "ADMIN")
    void testNoSePuedeDesactivarLaPropiaCuenta() throws Exception {
        System.out.println("Ejecutando testNoSePuedeDesactivarLaPropiaCuenta");
        String id = crearUsuarioDePrueba();
        MvcResult result = put("/api/usuarios/" + id + "/estado", "{\"sEstado\": \"INACTIVO\"}");
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("propia cuenta"));
    }

    private MvcResult put(String ruta, String json) throws Exception {
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.put(new URI(ruta))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .accept(MediaType.APPLICATION_JSON);
        return mockMvc.perform(req).andReturn();
    }

    /* Un usuario sin rol ADMIN no puede listar ni crear usuarios */
    @Test
    @WithMockUser(username = "estudiante.prueba@utp.edu.pe", authorities = "ESTANDAR")
    void testEstudianteNoPuedeListarNiCrearUsuarios() throws Exception {
        System.out.println("Ejecutando testEstudianteNoPuedeListarNiCrearUsuarios");
        MvcResult lista = mockMvc.perform(MockMvcRequestBuilders.get(new URI("/api/usuarios"))).andReturn();
        assertEquals(HttpStatus.FORBIDDEN.value(), lista.getResponse().getStatus());
        MvcResult creado = mockMvc.perform(MockMvcRequestBuilders.post(new URI("/api/usuarios"))
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andReturn();
        assertEquals(HttpStatus.FORBIDDEN.value(), creado.getResponse().getStatus());
    }

    /* El perfil propio es accesible con cualquier rol */
    @Test
    @WithMockUser(username = "julio.admin@utp.edu.pe", authorities = "ESTANDAR")
    void testMiPerfilDevuelveSoloAlUsuarioAutenticado() throws Exception {
        System.out.println("Ejecutando testMiPerfilDevuelveSoloAlUsuarioAutenticado");
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get(new URI("/api/usuarios/me"))).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"sEmail\":\"julio.admin@utp.edu.pe\""));
        assertFalse(result.getResponse().getContentAsString().startsWith("["));
    }
}
