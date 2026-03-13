package ru.sberbank.ai.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    void save(MultipartFile file);

}
