package com.example.legal_connect.config;

import com.example.legal_connect.security.OAuth2AuthenticationSuccessHandler;
import com.example.legal_connect.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Keep CSRF protection disabled globally for simplicity with SockJS/STOMP.
            // If you want CSRF enabled, you'll need to configure CsrfTokenRepository and
            // allow the handshake endpoints to be excluded. For now we explicitly disable
            // CSRF since STOMP messages use the HTTP handshake and then WebSocket frames.
            .csrf(csrf -> csrf.disable())
            .userDetailsService(customUserDetailsService)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                       .maximumSessions(1)
                       .maxSessionsPreventsLogin(false)
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll()
                .requestMatchers("/api/auth/oauth/mobile/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/", "/docs", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/api/upload/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/lawyer/apply").hasRole("USER")
                .requestMatchers("/api/lawyer/**").hasAnyRole("USER", "LAWYER")
                // Allow the websocket handshake endpoints (SockJS uses /ws/info) and
                // allow OPTIONS preflight requests. The actual STOMP destinations are
                // authorized by application logic and the WebSocketAuthInterceptor.
                .requestMatchers("/ws/**", "/ws/info/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/chat/online-users").permitAll()
                .requestMatchers("/api/chat/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureUrl("http://localhost:3000/auth/error")
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .deleteCookies("LOGGED_IN")
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}