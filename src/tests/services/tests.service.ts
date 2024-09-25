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

    async getAllTests() {
      const all_tests = await this.testsRepository.find();
  
      const res = {
          success: 'success',
          message: 'successful',
          data: all_tests,
      };

      return res;
    }

    async getTestById(id: number): Promise<any | undefined> {
      try {
          const test = await this.testsRepository.findOneBy({ id });
          if (!test)
              throw new HttpException('Question not found', HttpStatus.BAD_REQUEST);
      
          let data = {
              test,
              success: 'success',
          };
          return data;
      } catch (err) {}
    }

    async createTest(testData: Partial<Test>): Promise<any> {
      const user = await this.usersService.getUserAccountById(testData.userId)
  
      try{
          const newTest = this.testsRepository.create({
              user: user,
              markPerQuestion: testData.markPerQuestion,
              title: testData.title,
              code: testData.code,
              durationHours: testData.durationHours,
              durationMinutes: testData.durationMinutes,
              instructions: testData.instructions,
              startDate: testData.startDate,
              endDate: testData.endDate,
              createdAt: new Date(),
              updatedAt: new Date(),
          });

          console.log(newTest, 'newTest')
          await this.testsRepository.save(newTest);
          let data = {
              success: 'success',
          };
          return data;

      } catch (err) {
          let data = {
              error: err.message,
          };
          return data;
      }
    };

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

    async addQuestionTest(testId: number, questionId: number, is_added: any): Promise<any> {
        try{
            const test = await this.testsRepository.findOne({ where : { id: testId} });
        
            if(!test) {
              return {
                error: 'error',
                message: 'Test not found'
              }
            }

            const question = await this.questionsRepository.findOne({ where : { id: questionId }, relations: ['questionTest'] });
        
            const existingEntry = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })

            const is_question_test_added = is_added.is_added;
            // console.log( is_added.is_added === 0, is_added.is_added, question, existingEntry )
            // return;
            if( is_question_test_added === 0 ){
                if(!existingEntry){
                    const savedQuestionTest = await this.createQuestionTest(test, question, question); 
                    console.log(savedQuestionTest);
                } 
                else{
                    const saveNewQuestion = await this.questionsTestRepository.update(
                        { id: existingEntry.id },
                        {   
                            question: question.question,
                            optionAnswerTypeId: question.optionTypeId,
                            mark: question.marks??Number(0),
                            instruction: question.instruction??null,
                        },
                    ); 
                    if(saveNewQuestion.affected < 1){
                        return {
                            error:'error',
                            message: 'An error has occurred'
                        }
                    }
                }
            }

            if(is_question_test_added === 1 && existingEntry){
                await this.questionsTestRepository.delete(existingEntry.id);
            }

            console.log(question, question.questionTest, test.id)
            const existingEntry2 = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })

            const questionData ={
                ...question,
                is_added: existingEntry2 ? true : false
            }

            return {
                success: 'success',
                question: questionData,
                message: 'Question Test updated successfully'
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
            optionAnswerTypeId: question.optionTypeId,
            mark: questionTestData.marks??Number(0),
            instruction: questionTestData.instruction??null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(newQuestionTest, 'newQuestionTest')

        const saveNewQuestionTest = await this.questionsTestRepository.save(newQuestionTest);
        if(saveNewQuestionTest)
            return true;
        else 
            return false;
    }

    async updateTest(id: number, testData: Partial<Test>): Promise<any> {
        try{
            const test = await this.testsRepository.findOne({ 
                where: { id },
            });
  
            if (!test) {
                throw new NotFoundException('Exam not found');
            }
  
            await this.testsRepository.update(
                { id },
                {   
                    markPerQuestion: testData.markPerQuestion,
                    title: testData.title,
                    code: testData.code,
                    durationHours: testData.durationHours,
                    durationMinutes: testData.durationMinutes,
                    instructions: testData.instructions,
                    startDate: testData.startDate,
                    endDate: testData.endDate,
                },
            );

            const updatedTest = await this.testsRepository.findOne({
            where: { id },
        });
    
        let data = {
            success: 'success',
            message: 'Test updated successfully',
            data: updatedTest,
        };
        return data;

        } catch (err){
            let data = {
                error: err.message,
            };
            return data;
        }
    }

    async deleteTest(id: number): Promise<any> {
        try {
            const exam = await this.testsRepository.findOne({
                where: { id },
            });
        
            if (!exam) {
                return { error: 'error', message: 'Exam not found' };
            }

            await this.testsRepository.delete(id);
            return { success: 'success', message: 'Exam deleted successfully' };

        } catch (err) {
                console.error('Error deleting Exam:', err);
                throw new HttpException(
                    'Error deleting Exam',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
  }
}
