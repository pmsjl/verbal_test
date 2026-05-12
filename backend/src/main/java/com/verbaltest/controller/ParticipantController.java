package com.verbaltest.controller;

import com.verbaltest.dto.ParticipantCreateRequest;
import com.verbaltest.dto.ParticipantCreateResponse;
import com.verbaltest.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @PostMapping
    public ParticipantCreateResponse create(@Valid @RequestBody ParticipantCreateRequest req) {
        Long id = participantService.create(req);
        return new ParticipantCreateResponse(id);
    }
}
