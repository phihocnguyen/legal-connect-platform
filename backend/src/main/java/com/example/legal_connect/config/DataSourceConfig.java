package com.example.legal_connect.config;

import java.net.URI;
import java.net.URISyntaxException;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import com.zaxxer.hikari.HikariDataSource;

/**
 * DataSourceConfig reads common env vars and provides a DataSource bean.
 * Priority:
 * 1. SPRING_DATASOURCE_URL (full JDBC URL)
 * 2. DATABASE_URL (postgres style, e.g. postgresql://user:pass@host:5432/db?params)
 * 3. Construct from DB_HOST/DB_PORT/DB_NAME with defaults.
 *
 * This allows using the provided Neon URL (postgresql://...) as a fallback when no host is available.
 */
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource(Environment env) {
        // 1) If full JDBC URL provided explicitly
        String springUrl = env.getProperty("SPRING_DATASOURCE_URL");
        if (springUrl != null && !springUrl.isBlank()) {
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(springUrl);
            ds.setUsername(env.getProperty("SPRING_DATASOURCE_USERNAME", env.getProperty("DB_USERNAME", "postgres")));
            ds.setPassword(env.getProperty("SPRING_DATASOURCE_PASSWORD", env.getProperty("DB_PASSWORD", "postgres")));
            return ds;
        }

        // 2) If DATABASE_URL (common in hosted DBs) is present, parse it
        String databaseUrl = env.getProperty("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            try {
                // Accept both "postgres://..." and "postgresql://..."
                String normalized = databaseUrl.startsWith("jdbc:") ? databaseUrl : databaseUrl;
                URI uri = new URI(normalized);

                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null) {
                    String[] up = userInfo.split(":", 2);
                    username = up.length > 0 ? up[0] : null;
                    password = up.length > 1 ? up[1] : null;
                }

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath() == null ? "" : uri.getPath(); // includes leading '/'
                String query = uri.getQuery();

                String jdbc = "jdbc:postgresql://" + host + ":" + port + path + (query != null ? "?" + query : "");

                HikariDataSource ds = new HikariDataSource();
                ds.setJdbcUrl(jdbc);
                if (username != null) ds.setUsername(username);
                if (password != null) ds.setPassword(password);
                return ds;
            } catch (URISyntaxException e) {
                // Fall through to the final fallback below
                System.err.println("Failed to parse DATABASE_URL: " + e.getMessage());
            }
        }

        // 3) Final fallback: use DB_HOST/DB_PORT/DB_NAME (defaults to localhost/5432/legal_connect)
        String host = env.getProperty("DB_HOST", "localhost");
        String port = env.getProperty("DB_PORT", "5432");
        String dbName = env.getProperty("DB_NAME", "legal_connect");
        String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(env.getProperty("SPRING_DATASOURCE_URL", jdbc));
        ds.setUsername(env.getProperty("SPRING_DATASOURCE_USERNAME", env.getProperty("DB_USERNAME", "postgres")));
        ds.setPassword(env.getProperty("SPRING_DATASOURCE_PASSWORD", env.getProperty("DB_PASSWORD", "postgres")));
        return ds;
    }
}
