package com.example.legal_connect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class LegalConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(LegalConnectApplication.class, args);
	}

}
