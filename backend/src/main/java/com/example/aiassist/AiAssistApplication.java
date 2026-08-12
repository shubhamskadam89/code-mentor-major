

package com.example.aiassist;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@Slf4j
@EnableAsync
@SpringBootApplication(scanBasePackages = "com.example.aiassist")
public class AiAssistApplication {

	public static void main(String[] args) {
		// Try to load from root directory
		Dotenv dotenv = Dotenv.configure()
				.directory("./")
				.ignoreIfMissing()
				.load();
		for (DotenvEntry entry : dotenv.entries()) {
			System.setProperty(entry.getKey(), entry.getValue());
		}

		// Also check in ./backend/ folder for backend/.env
		Dotenv backendDotenv = Dotenv.configure()
				.directory("./backend")
				.ignoreIfMissing()
				.load();
		for (DotenvEntry entry : backendDotenv.entries()) {
			System.setProperty(entry.getKey(), entry.getValue());
		}

		SpringApplication.run(AiAssistApplication.class, args);
		log.info("Backend Started successfully");
	}

}
