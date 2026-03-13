package ru.sberbank.ai.config;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;

import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VectorStoreInitializer {

    private static boolean isInitialized = false;

    private final TextSplitter textSplitter;

    private final VectorStore vectorStore;

    @SneakyThrows
    public void initialize(String path) {
        if (isInitialized) return;

        // Создаем TikaDocumentReader для чтения DOCX файла
        Path filePath = Paths.get(path)
                .toAbsolutePath().normalize();

        List<Path> docs = new ArrayList<>();

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(filePath, entry ->
                Files.isRegularFile(entry) && entry.toString().toLowerCase().endsWith("docx"))) {
            for (Path entry : stream) {
                docs.add(entry);
            }
        }

        FileSystemResource resource = new FileSystemResource(docs.get(0).toFile());
        TikaDocumentReader documentReader = new TikaDocumentReader(resource);

        // Читаем документ
        List<Document> documents = documentReader.get();

        // Разбиваем документ на меньшие части, если необходимо
        List<Document> splitDocuments = textSplitter.apply(documents);

        // Загружаем данные в vector store
        vectorStore.add(splitDocuments);

        isInitialized = true;
    }

    public void clear() {
        List<Document> allDocs = vectorStore.similaritySearch("");
        List<String> allDocsIds = allDocs.stream().map(Document::getId).toList();
        vectorStore.delete(allDocsIds);
    }

}
