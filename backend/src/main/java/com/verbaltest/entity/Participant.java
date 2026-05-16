package com.verbaltest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("participant")
public class Participant {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String code;
    private Integer age;
    private String gender;
    private String musicHabit;
    private LocalDateTime createdAt;
}
