package com.example.aiassist.signal.engine;

import com.example.aiassist.signal.model.Approach;
import com.example.aiassist.problem.entity.Problem;
import com.example.aiassist.signal.model.ValidationResult;
import org.springframework.stereotype.Component;

@Component
public class ApproachValidationEngine {

    public ValidationResult validate(Problem problem, Approach detected) {

        if (problem.getValidApproaches().contains(detected.getType())) {
            return ValidationResult.CORRECT;
        }

        if (problem.getInvalidApproaches().contains(detected.getType())) {
            return ValidationResult.WRONG;
        }

        return ValidationResult.SUSPICIOUS;
    }
}
