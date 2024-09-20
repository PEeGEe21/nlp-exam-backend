import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/typeorm/entities/Answer';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Question } from 'src/typeorm/entities/Question';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(DifficultyType)
    private readonly difficultyRepository: Repository<DifficultyType>,
    @InjectRepository(DifficultyType)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(DifficultyType)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async seedDifficulties() {
    const difficulties = [
      { id: 1, title: 'EASY', description: null },
      { id: 2, title: 'MEDIUM', description: null },
      { id: 3, title: 'INTERMEDIATE', description: null },
      { id: 4, title: 'ADVANCED', description: null },
      { id: 5, title: 'HARD', description: null },
    ];

    for (const difficulty of difficulties) {
      const existingDifficulty = await this.difficultyRepository.findOne({ where: { id: difficulty.id } });
      if (!existingDifficulty) {
        const newDifficulty = this.difficultyRepository.create({
          ...difficulty,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.difficultyRepository.save(newDifficulty);
        console.log(`Difficulty ${difficulty.title} has been seeded`);
      }
    }

    console.log('Difficulties seeding completed');
  }

  async seedQuestions() {
    const questions = [
      {
        id: 1,
        userId: 2,
        optionTypeId: 1,
        difficultyId: 1,
        question: "What is the capital of France?",
        answers: [
          { id: 1, content: "Paris", isCorrect: true },
          { id: 2, content: "London", isCorrect: false },
          { id: 3, content: "Berlin", isCorrect: false },
          { id: 4, content: "Madrid", isCorrect: false }
        ]
      },
      {
        id: 2,
        userId: 1,
        optionTypeId: 1,
        difficultyId: 1,
        question: "The Earth is flat.",
        answers: [
          { id: 1, content: "True", isCorrect: false },
          { id: 2, content: "False", isCorrect: true }
        ]
      },
      {
        id: 3,
        userId: 3,
        optionTypeId: 1,
        difficultyId: 2,
        question: "Which planet is known as the Red Planet?",
        answers: [
          { id: 1, content: "Mars", isCorrect: true },
          { id: 2, content: "Jupiter", isCorrect: false },
          { id: 3, content: "Saturn", isCorrect: false },
          { id: 4, content: "Venus", isCorrect: false }
        ]
      },
    ];

    for (const question of questions) {
      const existingQuestion = await this.questionRepository.findOne({ where: { id: question.id } });
      if (!existingQuestion) {
        const newQuestion = this.questionRepository.create({
          userId: question.userId,
          difficultyId: question.difficultyId,
          optionTypeId: question.optionTypeId,
          question: question.question,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const newNewQuestion = await this.questionRepository.save(newQuestion);

        await this.createAnswers(question, newNewQuestion);

        console.log(`Question ${question.question} has been seeded`);
      }
    }

    console.log('Questions seeding completed');
  }

  async createAnswers(question, newQuestion){
    for (const answer of question.answers) {
      const existingAnswer = await this.answerRepository.findOne({ where: { id: answer.id } });
      if (!existingAnswer) {
        const newAnswer = this.answerRepository.create({
          question: newQuestion,
          isCorrect: answer.isCorrect ? 1 : 0,
          content: answer.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
          
        await this.answerRepository.save(newAnswer);
      }
    }
  }
}
