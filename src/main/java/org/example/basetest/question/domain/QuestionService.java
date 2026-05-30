package org.example.basetest.question.domain;

import org.example.basetest.question.api.dto.QuestionDTO;
import org.example.basetest.question.api.dto.QuestionMapper;
import org.example.basetest.question.db.QuestionEntity;
import org.example.basetest.question.db.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;


    public QuestionService(QuestionRepository questionRepository, QuestionMapper questionMapper) {
        this.questionRepository = questionRepository;
        this.questionMapper = questionMapper;
    }
    //========================================Controller===========================================================


    public QuestionDTO findDtoById(Long id) {
        return questionMapper.convertEntityToQuestionDto(questionRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Question not found")));
    }

    //========================================Service===========================================================

    public QuestionEntity findById(Long id) {
        return questionRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Question not found"));
    }

    public QuestionEntity save(QuestionEntity question) {
        return questionRepository.save(question);
    }

}
