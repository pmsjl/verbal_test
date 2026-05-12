package com.verbaltest.service;

import com.verbaltest.dto.RecordCreateRequest;
import com.verbaltest.dto.RecordView;

import java.util.List;

public interface RecordService {
    /** 新增一条测试记录，返回主键 id。 */
    Long create(RecordCreateRequest req);

    /** 列出全部测试记录，已扁平化关联 participant 信息。 */
    List<RecordView> listAll();

    /** 导出全部记录关联被试信息为 CSV 字符串。 */
    String exportCsv();
}
