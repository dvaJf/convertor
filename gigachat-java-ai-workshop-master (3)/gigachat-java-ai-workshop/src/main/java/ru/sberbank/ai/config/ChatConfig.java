package ru.sberbank.ai.config;

import chat.giga.springai.GigaChatOptions;
import chat.giga.springai.advisor.GigaChatCachingAdvisor;
import chat.giga.springai.api.chat.GigaChatApi;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder chatClientBuilder, QuestionAnswerAdvisor ragAdvisor) {
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(new InMemoryChatMemoryRepository())
                .maxMessages(500)
                .build();
        return chatClientBuilder
                .defaultSystem("""
                        ТЫ В ЛЮБОМ СЛУЧАЕ ОБЯЗАН ДАТЬ ПРОГНОЗ
                        Ты — аналитик финансовых рынков, специализирующийся на валютных курсах. Твоя задача — анализировать курсы валют.
                        Входные данные:
                        Текущие курсы валюты с бирж.
                        Ответ:
                        Прогноз куда пойдет курс валюты в 4-5 предложениях СТРОГО БЕЗ ДАТ ТОЛЬКО ПРОГНОЗ ЧТО КУРС БУДЕТ РАСТИ ПАДАТЬ ИЛИ НЕ МЕНЯТСЯ
                        """)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new GigaChatCachingAdvisor(),
                        new SimpleLoggerAdvisor(),
                        ragAdvisor)
                .defaultOptions(GigaChatOptions.builder()
                        .model(GigaChatApi.ChatModel.GIGA_CHAT_2_MAX)
                        .build())
                .build();
    }

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }

    @Bean
    public QuestionAnswerAdvisor ragAdvisor(VectorStore vectorStore) {
        return QuestionAnswerAdvisor.builder(vectorStore).build();
    }

    @Bean
    public TextSplitter textSplitter(
            @Value("${rag.chunk-size:450}") int chunkSize,
            @Value("${rag.min-chunk-size-chars:50}") int minChunkSizeChars,
            @Value("${rag.min-chunk-length-to-embed:5}") int minChunkLengthToEmbed,
            @Value("${rag.max-num-chunks:10000}") int maxNumChunks,
            @Value("${rag.keep-separator:true}") boolean keepSeparator) {
        return new TokenTextSplitter(chunkSize, minChunkSizeChars, minChunkLengthToEmbed, maxNumChunks, keepSeparator);
    }

}
