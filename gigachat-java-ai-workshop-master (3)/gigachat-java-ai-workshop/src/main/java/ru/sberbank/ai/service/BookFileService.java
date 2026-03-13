package ru.sberbank.ai.service;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.sberbank.ai.config.FileLocationProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class BookFileService implements FileService {
    private final Path bookStoragePath;

    public BookFileService(FileLocationProperties fileStorageProperties) throws IOException {
        this.bookStoragePath = Paths.get(fileStorageProperties.getBookFileLocation())
                .toAbsolutePath().normalize();
    }

    @Override
    public void save(MultipartFile multipartFile) {
        String originalFileName = multipartFile.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + fileExtension;
        Path targetLocation = this.bookStoragePath.resolve(fileName);
        try {
            FileUtils.deleteDirectory(bookStoragePath.toFile());
            if (Files.notExists(targetLocation.getParent())) {
                Files.createDirectories(targetLocation.getParent());
            }
            Files.copy(multipartFile.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
