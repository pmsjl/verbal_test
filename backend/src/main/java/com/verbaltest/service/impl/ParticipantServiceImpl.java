package com.verbaltest.service.impl;

import com.verbaltest.dto.ParticipantCreateRequest;
import com.verbaltest.entity.Participant;
import com.verbaltest.mapper.ParticipantMapper;
import com.verbaltest.service.ParticipantService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ParticipantServiceImpl implements ParticipantService {

    private final ParticipantMapper participantMapper;

    public ParticipantServiceImpl(ParticipantMapper participantMapper) {
        this.participantMapper = participantMapper;
    }

    @Override
    public Long create(ParticipantCreateRequest req) {
        Participant p = new Participant();
        p.setCode(req.code());
        p.setAge(req.age());
        p.setGender(req.gender());
        p.setMusicHabit(req.musicHabit());
        p.setCreatedAt(LocalDateTime.now());
        participantMapper.insert(p);
        return p.getId();
    }
}
