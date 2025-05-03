package com.finki.uiktp.edugen;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduGenApplication {

	public static void main(String[] args) {
		/*Dotenv dotenv = Dotenv.load();
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		System.setProperty("API_KEY", dotenv.get("API_KEY"));*/
		SpringApplication.run(EduGenApplication.class, args);
	}

}
