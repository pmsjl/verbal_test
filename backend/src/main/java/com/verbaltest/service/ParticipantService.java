package com.verbaltest.service;

import com.verbaltest.dto.ParticipantCreateRequest;

public interface ParticipantService {
    /** 录入被试，返回主键 id。 */
    Long create(ParticipantCreateRequest req);
}
