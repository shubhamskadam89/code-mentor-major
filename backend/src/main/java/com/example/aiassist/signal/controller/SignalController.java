package com.example.aiassist.signal.controller;
import com.example.aiassist.problem.dto.HintResponse;
import com.example.aiassist.signal.model.SignalRequest;
import com.example.aiassist.signal.service.SignalService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SignalController {

    private final SignalService signalService;

    public SignalController(SignalService signalService) {
        this.signalService = signalService;
    }

    @PostMapping("/signal")
    public HintResponse handleSignal(@RequestBody SignalRequest req) {
        return signalService.handleSignal(req);
    }
}
