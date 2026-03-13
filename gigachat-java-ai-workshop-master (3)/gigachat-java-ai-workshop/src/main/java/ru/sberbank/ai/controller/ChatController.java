package ru.sberbank.ai.controller;

import chat.giga.springai.advisor.GigaChatCachingAdvisor;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ru.sberbank.ai.config.FileLocationProperties;
import ru.sberbank.ai.config.VectorStoreInitializer;
import ru.sberbank.ai.service.FileService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatClient chatClient;

    private final VectorStoreInitializer vectorStoreInitializer;

    private final FileService bookFileService;

    private final FileLocationProperties fileLocationProperties;

    @CrossOrigin(origins = "*")
    @PostMapping("/session")
    public String session(HttpSession httpSession, @RequestBody String userMessage) {
        return chatClient
                .prompt(userMessage)
                .advisors(a -> a.param(GigaChatCachingAdvisor.X_SESSION_ID, httpSession.getId()))
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, httpSession.getId()))
                .call()
                .content();
    }

    @PostMapping(path = "/upload/book", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadBook(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            bookFileService.save(file);
            vectorStoreInitializer.clear();
            vectorStoreInitializer.initialize(fileLocationProperties.getBookFileLocation());
            response.put("message", "Учебник успешно загружен");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Ошибка сохранения учебника: " + e.getMessage()));
        }
    }

}
