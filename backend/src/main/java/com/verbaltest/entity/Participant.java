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
    /** 英语水平自评：1=弱 / 2=中 / 3=强。 */
    private Integer englishLevel;
    private String musicHabit;
    private LocalDateTime createdAt;
}
