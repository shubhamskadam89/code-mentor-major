package com.example.aiassist.ai.analysis.engine;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;

import com.example.aiassist.ai.classification.engine.AiProblemClassifier;

@Configuration
public class AiConfiguration {

    @Value("${ai.mode:rule}")
    private String mode;

    // Inject by interface + qualifier to avoid JDK proxy type mismatch from @Async
    @Bean
    @Primary
    public AiProblemClassifier problemClassifier(
            @Qualifier("ruleBasedProblemClassifier") AiProblemClassifier rule) {
        return rule;
    }

    @Bean
    @Primary
    public AiCodeAnalyzer codeAnalyzer(
            @Qualifier("ruleBasedCodeAnalyzer") AiCodeAnalyzer rule) {
        return rule;
    }
}
