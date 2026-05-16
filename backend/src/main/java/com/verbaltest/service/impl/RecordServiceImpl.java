package com.verbaltest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.verbaltest.dto.RecordCreateRequest;
import com.verbaltest.dto.RecordView;
import com.verbaltest.entity.Participant;
import com.verbaltest.entity.TestRecord;
import com.verbaltest.mapper.ParticipantMapper;
import com.verbaltest.mapper.TestRecordMapper;
import com.verbaltest.service.RecordService;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RecordServiceImpl implements RecordService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final TestRecordMapper recordMapper;
    private final ParticipantMapper participantMapper;

    public RecordServiceImpl(TestRecordMapper recordMapper, ParticipantMapper participantMapper) {
        this.recordMapper = recordMapper;
        this.participantMapper = participantMapper;
    }

    @Override
    public Long create(RecordCreateRequest req) {
        TestRecord r = new TestRecord();
        r.setParticipantId(req.participantId());
        r.setCondition(req.condition());
        r.setScore(req.score());
        r.setDurationMs(req.durationMs());
        r.setCreatedAt(LocalDateTime.now());
        recordMapper.insert(r);
        return r.getId();
    }

    @Override
    public List<RecordView> listAll() {
        return loadJoined();
    }

    @Override
    public String exportCsv() {
        List<RecordView> rows = loadJoined();
        StringWriter sw = new StringWriter();
        try (PrintWriter w = new PrintWriter(sw)) {
            w.println("record_id,participant_id,code,age,gender,music_habit," +
                    "condition,score,duration_ms,tested_at");
            for (RecordView v : rows) {
                w.print(v.id()); w.print(',');
                w.print(v.participantId()); w.print(',');
                w.print(csv(v.code())); w.print(',');
                w.print(v.age() == null ? "" : v.age()); w.print(',');
                w.print(csv(v.gender())); w.print(',');
                w.print(csv(v.musicHabit())); w.print(',');
                w.print(csv(v.condition())); w.print(',');
                w.print(v.score()); w.print(',');
                w.print(v.durationMs()); w.print(',');
                w.print(v.createdAt() == null ? "" : v.createdAt().format(TS));
                w.println();
            }
        }
        return sw.toString();
    }

    private List<RecordView> loadJoined() {
        List<TestRecord> records = recordMapper.selectList(
                Wrappers.<TestRecord>lambdaQuery().orderByAsc(TestRecord::getId));
        if (records.isEmpty()) return List.of();

        List<Long> participantIds = records.stream()
                .map(TestRecord::getParticipantId)
                .distinct()
                .toList();

        Map<Long, Participant> participantMap = participantMapper.selectBatchIds(participantIds).stream()
                .collect(Collectors.toMap(Participant::getId, Function.identity()));

        List<RecordView> out = new ArrayList<>(records.size());
        for (TestRecord r : records) {
            Participant p = participantMap.get(r.getParticipantId());
            out.add(new RecordView(
                    r.getId(),
                    r.getParticipantId(),
                    p == null ? null : p.getCode(),
                    p == null ? null : p.getAge(),
                    p == null ? null : p.getGender(),
                    p == null ? null : p.getMusicHabit(),
                    r.getCondition(),
                    r.getScore(),
                    r.getDurationMs(),
                    r.getCreatedAt()
            ));
        }
        return out;
    }

    @Override
    public void delete(Long id) {
        recordMapper.deleteById(id);
    }

    @Override
    public int batchDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return 0;
        return recordMapper.deleteBatchIds(ids);
    }

    private static String csv(Object v) {
        if (v == null) return "";
        String s = v.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
