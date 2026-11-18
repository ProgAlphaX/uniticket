package pe.edu.utp.uniticket_backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.utp.uniticket_backend.dto.LoginRequestDTO;
import pe.edu.utp.uniticket_backend.security.JWTUtil;
import pe.edu.utp.uniticket_backend.security.LoginAttemptService;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionController {
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JWTUtil jwtUtil;
    private final LoginAttemptService loginAttempts;

    public AutenticacionController(AuthenticationManager authenticationManager,
                                    UserDetailsService userDetailsService, JWTUtil jwtUtil,
                                    LoginAttemptService loginAttempts) {
        this.loginAttempts = loginAttempts;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequestDTO datos, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        loginAttempts.verificarNoBloqueado(datos.sEmail(), ip);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(datos.sEmail(), datos.sPassword()));
        } catch (BadCredentialsException e) {
            loginAttempts.registrarFallo(datos.sEmail(), ip);
            throw e;
        }
        loginAttempts.registrarExito(datos.sEmail(), ip);
        UserDetails userDetails = userDetailsService.loadUserByUsername(datos.sEmail());
        String token = jwtUtil.generateToken(userDetails.getUsername());
        return ResponseEntity.ok(token);
    }
}
