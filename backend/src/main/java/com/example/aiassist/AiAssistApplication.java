

package com.example.aiassist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication(scanBasePackages = "com.example.aiassist")
public class AiAssistApplication {

	public static void main(String[] args) {
		SpringApplication.run(AiAssistApplication.class, args);
		System.out.println("Backend Started ");
	}

}
