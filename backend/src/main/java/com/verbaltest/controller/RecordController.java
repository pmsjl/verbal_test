package com.verbaltest.controller;

import com.verbaltest.dto.RecordCreateRequest;
import com.verbaltest.dto.RecordCreateResponse;
import com.verbaltest.dto.RecordView;
import com.verbaltest.service.RecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/records")
public class RecordController {

    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final RecordService recordService;

    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping
    public RecordCreateResponse create(@Valid @RequestBody RecordCreateRequest req) {
        Long id = recordService.create(req);
        return new RecordCreateResponse(id);
    }

    @GetMapping
    public List<RecordView> list() {
        return recordService.listAll();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv() {
        String csv = recordService.exportCsv();
        // 加 UTF-8 BOM，避免 Excel 中文乱码
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] body = csv.getBytes(StandardCharsets.UTF_8);
        byte[] out = new byte[bom.length + body.length];
        System.arraycopy(bom, 0, out, 0, bom.length);
        System.arraycopy(body, 0, out, bom.length, body.length);

        String filename = "verbal_test_records_" + LocalDateTime.now().format(STAMP) + ".csv";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(out);
    }
}
