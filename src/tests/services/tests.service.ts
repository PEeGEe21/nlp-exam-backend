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
      const all_tests = await this.testsRepository.find({relations: ['user']});
  
    //   const updatedQuestions = all_tests.map((question) => {
    //         question.formatted_start_date = 
    //     });

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
        
            let questionsQuery = this.questionsRepository.createQueryBuilder('question');

            // Define the relationships and select specific fields
            questionsQuery
                .leftJoinAndSelect('question.answers', 'answers')
                .leftJoinAndSelect('question.difficulty', 'difficulty')
                .leftJoinAndSelect('question.optionType', 'optionType')
                .leftJoinAndSelect('question.questionTests', 'questionTest', 'questionTest.testId = :testId', { testId })
                .addSelect(['question.id', 'question.question', 'question.optionTypeId']) // Adjust the fields you want to select
                .addSelect(['answers.id', 'answers.content', 'answers.isCorrect'])
                .addSelect(['difficulty.id', 'difficulty.title'])
                .addSelect(['optionType.id', 'optionType.title']);
        
            // Execute the query
            const questions = await questionsQuery.getMany();
        
            // Map the results to include is_added flag
            const updatedQuestions = questions.map((question) => {
                const isAdded = question.questionTests.length > 0; 
                
                // console.log(question.questionTests[0])// Adjust logic as needed
                const question_test_id = question.questionTests[0]?.id; // Adjust logic as needed
                const question_test_mark = question.questionTests[0]?.mark; // Adjust logic as needed
                return { ...question, is_added: isAdded, question_test_id: question_test_id, question_test_mark: question_test_mark };
            });


            // console.log(updatedQuestions, 'sdsd')
            // const questions = await this.questionsRepository.find({ relations: ['questionTests', 'answers', 'difficulty', 'optionType']});

            // console.log(questions);
            // const updatedQuestions = questions.map((question) => {
            //     const isAdded = question.questionTests.some(qt => qt.testId === test.id); // Adjust this line based on your relationship setup
            //     return { ...question, is_added: isAdded };
            // });
            // const updatedQuestions = questions.map((question) => {
            //     if (question.questionTest && question.questionTest.testId === test.id) {
            //         return { ...question, is_added: true };
            //     } else {
            //         return { ...question, is_added: false };
            //     }
            // });

            // console.log(questions, 'questions');
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

            // console.log(questionId, 'wd')
            const question = await this.questionsRepository.findOne({ where : { id: questionId }, relations: ['questionTests'] });
        
            if(!question){
                return {
                    error: 'error',
                    message: 'Question not found'
                  }
            }
            const existingEntry = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })

            const is_question_test_added = is_added.is_added;
            console.log( is_added.is_added === 0, is_added.is_added, question, existingEntry )
            // return;
            if( is_question_test_added === 1 ){
                if(!existingEntry){
                    const savedQuestionTest = await this.createQuestionTest(test, question, question); 
                    console.log(savedQuestionTest, 'hereeeeeee');
                    console.log(existingEntry)


                    if(savedQuestionTest){
                        const updatedTestMark = test.totalMarks + Number(savedQuestionTest.mark);
                        const totalQuestions = test.totalQuestions + 1;
                        await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :updatedTestMark});
            
                    } else{
                        return{
                            error: 'error',
                            message: 'An error occurred!'
                        }
                    }
                    
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

                    const savedUpdatedQuestion = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })
                    const updatedTestMark = test.totalMarks + Number(savedUpdatedQuestion.mark);
                    const totalQuestions = test.totalQuestions + 1;
                    await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :updatedTestMark});
            
                }

                }

            if(is_question_test_added === 0 && existingEntry){
                let updatedTestMark 
                if(test.totalQuestions > 0){
                    updatedTestMark = test.totalMarks - Number(existingEntry.mark);
                }
                let totalQuestions = test.totalQuestions;
                if(test.totalQuestions > 0){
                    totalQuestions = test.totalQuestions -= 1;
                }

                await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :updatedTestMark});
                await this.questionsTestRepository.delete(existingEntry.id);

            }

            // console.log(question, question.questionTest, test.id)
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
        // console.log(test, question, questionTestData)
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

        // console.log(newQuestionTest, 'newQuestionTest')

        const saveNewQuestionTest = await this.questionsTestRepository.save(newQuestionTest);
        if(saveNewQuestionTest)
            return saveNewQuestionTest;
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

            const updatedFields = Object.keys(testData).reduce((acc, key) => {
                if (testData[key] !== undefined) {
                    acc[key] = testData[key];
                }
                return acc;
            }, {});
    
            await this.testsRepository.update({ id }, updatedFields);

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

    async addTestQuestionMark(testId: number, questionId: number, set_mark: any): Promise<any> {
        try{
            const test = await this.testsRepository.findOne({ where : { id: testId} });
        
            if(!test) {
              return {
                error: 'error',
                message: 'Test not found'
              }
            }

            // console.log(questionId, 'wd')
            // const question = await this.questionsRepository.findOne({ where : { id: questionId }, relations: ['questionTests'] });
        
            // if(!question){
            //     return {
            //         error: 'error',
            //         message: 'Question not found'
            //       }
            // }
            const mark = set_mark.mark;

            console.log(mark, 'sdsdd')
            const existingEntry = await this.questionsTestRepository.findOne({ where : { id: questionId, testId: testId} })
    
           const updated =  await this.questionsTestRepository.update({ id :existingEntry.id }, {mark: Number(mark)});

           const updatedTestMark = test.totalMarks + Number(mark);
        //    const totalQuestions = test.totalQuestions += Number(mark);
            await this.testsRepository.update({ id :test.id }, { totalMarks: updatedTestMark});

           
           console.log(updated, 'updated')
            let data = {
                success: 'success',
                message: 'Question Test updated successfully',
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
