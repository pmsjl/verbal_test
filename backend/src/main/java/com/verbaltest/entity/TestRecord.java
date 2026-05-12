package com.verbaltest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("test_record")
public class TestRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long participantId;

    /** "no_music" 或 "music"。condition 是 MySQL 保留字，建表时用反引号包住。 */
    @TableField("`condition`")
    private String condition;

    private Integer score;
    private Long durationMs;
    private LocalDateTime createdAt;
}
