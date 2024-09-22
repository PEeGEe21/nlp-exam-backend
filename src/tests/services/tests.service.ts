import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyTypesService } from 'src/difficulty-types/services/difficulty-types.service';
import { OptionTypesService } from 'src/option-types/services/option-types.service';
import { Answer } from 'src/typeorm/entities/Answer';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { Question } from 'src/typeorm/entities/Question';
import { Test } from 'src/typeorm/entities/Test';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class TestsService {
    constructor(

        private usersService: UsersService,
        private difficultyService: DifficultyTypesService,
        private optionService: OptionTypesService,

        @InjectRepository(Question) private questionsRepository: Repository<Question>,
        @InjectRepository(QuestionTest) private questionsTestRepository: Repository<QuestionTest>,
        @InjectRepository(Test) private testsRepository: Repository<Test>

    ) {}

    async getQuestionTestsAssign(testId: number): Promise<any> {
        try{
            const test = await this.testsRepository.findOne({ where : { id: testId} });
        
            if(!test) {
              return {
                error: 'error',
                message: 'Test not found'
              }
            }
        
            const questions = await this.questionsRepository.find({ relations: ['questionTest']});

            const updatedQuestions = questions.map((question) => {
                if (question.questionTest && question.questionTest.testId === test.id) {
                    return { ...question, is_added: true };
                } else {
                    return { ...question, is_added: false };
                }
            });

            console.log(questions, 'questions');
            // return;
            return {
                success: true,
                data: updatedQuestions,
            };
            
          } catch (err) {
            console.log(err)
            return {
              error: 'error',
              message: 'An error occurred while sending project invites'
            }
        }

    }

    async addQuestionTest(testId: number, questionId: number, questionTestData: Partial<QuestionTest>): Promise<any> {
        try{
            const test = await this.testsRepository.findOne({ where : { id: testId} });
        
            if(!test) {
              return {
                error: 'error',
                message: 'Test not found'
              }
            }
        
            const question = await this.questionsRepository.findOne({ where : { id: questionId} });
        
            const savedQuestionTest = await this.createQuestionTest(test, question, questionTestData);

            if(savedQuestionTest){
                return {
                    success:'success',
                    message: 'Question Test saved successfully'
                }
            }
            
            
          } catch (err) {
            console.log(err)
            return {
              error: 'error',
              message: 'An error occurred while sending project invites'
            }
        }

    }

    async createQuestionTest(test, question, questionTestData){
        const newQuestionTest = this.questionsTestRepository.create({
            questionId: question.id,
            testId: test.id,
            question: question.question,
            optionAnswerTypeId: question.optionAnswerTypeId,
            mark: questionTestData.mark??Number(0),
            instruction: questionTestData.marks??null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const saveNewQuestionTest = await this.questionsTestRepository.save(newQuestionTest);
        if(saveNewQuestionTest)
            return true;
        else 
            return false;
    }
}
