package ru.sberbank.ai.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class FileLocationProperties {

    @Value("${storage.book}")
    private String bookFileLocation;

}
