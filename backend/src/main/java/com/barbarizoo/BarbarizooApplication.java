package com.barbarizoo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BarbarizooApplication {

    public static void main(String[] args) {
        SpringApplication.run(BarbarizooApplication.class, args);
    }
}
