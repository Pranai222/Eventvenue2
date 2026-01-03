package com.eventvenue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class EventVenueApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventVenueApplication.class, args);
        System.out.println("EventVenue Backend Started Successfully!");
    }
}
