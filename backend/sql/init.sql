-- Verbal Memory 实验数据库建库 + 建表脚本
-- 适用 MySQL 5.7+ / 8.0
-- 用法: mysql -u root -p < init.sql

CREATE DATABASE IF NOT EXISTS verbal_test
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE verbal_test;

-- 被试信息表
DROP TABLE IF EXISTS test_record;
DROP TABLE IF EXISTS participant;

CREATE TABLE participant (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  code            VARCHAR(32)  NOT NULL COMMENT '被试编号，实验员指定',
  age             INT          NOT NULL,
  gender          VARCHAR(8)   NOT NULL,

  music_habit     VARCHAR(64)  NOT NULL COMMENT '日常听音乐习惯（频率/类型）',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='被试信息表';

-- 测试记录表（一个被试可以做多次，不同条件各一次）
CREATE TABLE test_record (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  participant_id  BIGINT       NOT NULL,
  `condition`     VARCHAR(16)  NOT NULL COMMENT 'no_music / music',
  score           INT          NOT NULL COMMENT '最终得分（答对总次数）',
  duration_ms     BIGINT       NOT NULL COMMENT '完成时长，毫秒',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_participant (participant_id),
  KEY idx_condition (`condition`),
  CONSTRAINT fk_record_participant FOREIGN KEY (participant_id) REFERENCES participant(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测试记录表';
