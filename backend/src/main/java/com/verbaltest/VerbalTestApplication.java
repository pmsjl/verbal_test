package com.verbaltest;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.verbaltest.mapper")
public class VerbalTestApplication {
    public static void main(String[] args) {
        SpringApplication.run(VerbalTestApplication.class, args);
    }
}
