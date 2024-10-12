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
import { LessThanOrEqual, MoreThanOrEqual, Repository, MoreThan } from 'typeorm';
import { SaveStudentTestDto } from '../dtos/save-student-test.dto';
import { Student } from 'src/typeorm/entities/Student';
import { Result } from 'src/typeorm/entities/Result';
import { ResultsScore } from 'src/typeorm/entities/ResultsScore';
import { AnswerCheckService } from 'src/core/utils/AnswerCheckService';

@Injectable()
export class TestsService {
    constructor(

        private usersService: UsersService,
        private difficultyService: DifficultyTypesService,
        private optionService: OptionTypesService,
        private answerCheckService: AnswerCheckService,

        @InjectRepository(Student) private studentsRepository: Repository<Student>,
        @InjectRepository(Question) private questionsRepository: Repository<Question>,
        @InjectRepository(QuestionTest) private questionsTestRepository: Repository<QuestionTest>,
        @InjectRepository(Test) private testsRepository: Repository<Test>,
        @InjectRepository(Result) private resultRepository: Repository<Result>,
        @InjectRepository(ResultsScore) private resultsScoreRepository: Repository<ResultsScore>,

    ) {}

    async getAllTests() {
      const all_tests = await this.testsRepository.find({relations: ['user']});

    // await this.resetAllTests();
      const res = {
          success: 'success',
          message: 'successful',
          data: all_tests,
      };

      return res;
    }

    async getAllStudentTests() {
      const all_tests = await this.testsRepository.find({
        where: {totalQuestions: MoreThan(0), isPublished: 1}, 
        order: {
            createdAt: 'DESC', // Sort by creation date in descending order
        },
        relations: ['user']
    });

    // await this.resetAllTests();
      const res = {
          success: 'success',
          message: 'successful',
          data: all_tests,
      };

      return res;
    }

    async resetAllTests() {
        try {
            const all_tests = await this.testsRepository.find({ relations: ['user'] });
    
            for (const test of all_tests) {
                const questionTests = await this.questionsTestRepository.find({ where: { testId: test.id } });
    
                let totalMarks = 0;
                let totalQuestions = 0;
    
                for (const questionTest of questionTests) {
                    totalMarks += questionTest.mark || 0;
                    totalQuestions++;
                }
    
                const testUpdated = await this.testsRepository.update(
                    { id: test.id },
                    { totalQuestions, totalMarks }
                );
    
                if (testUpdated.affected < 1) {
                    return {
                        error: 'error',
                        message: 'An error has occurred while updating the test totals',
                    };
                }
            }
    
            return {
                success: 'success',
                message: 'Successfully retrieved and updated tests',
                data: all_tests,
            };
        } catch (error) {
            return {
                error: 'error',
                message: 'An unexpected error occurred',
                details: error.message,
            };
        }
    }
    

    async getTestById(id: number): Promise<any | undefined> {
      try {
          const test = await this.testsRepository.findOne({ where: {id: id} });
          if (!test)
          {
            return {
                error: 'error',
                message: 'Test not found'
            }
          }
      
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

        //   console.log(newTest, 'newTest')
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

    async saveStudentTest(test_id: number, studentTestData: SaveStudentTestDto): Promise<any> {
        console.log(studentTestData)

        // return;

      const user = await this.usersService.getUserAccountById(studentTestData.user_id);
      if(!user){
        return {
            error: 'error',
            message: 'User Not Found'
        }
      }

      const student = await this.studentsRepository.findOne({where: {user: user}})
      if(!student){
        return {
            error: 'error',
            message: 'Student Not Found'
        }
      }

      const test = await this.testsRepository.findOne({where: {id: test_id}});
      if(!test){
        return {
            error: 'error',
            message: 'Test Not Found'
        }
      }
  
      try{

        const answers = JSON.parse(studentTestData.answers);

        const selectedOptions = answers.selectedOptions;

        let totalCount = 0;
        let totalMarks = 0;
        let totalScored = 0;
        let questionTestIds = [];

        for (const [questionTestId, selectedOptionId] of Object.entries(selectedOptions)) {
            const questionTest = await this.questionsTestRepository.findOne({
              where: {
                id: Number(questionTestId),
                testId: test.id,
              },
              relations: ['questionRelation', 'questionRelation.answers',  'questionRelation.hints'],
            });
          
            if (questionTest) {
                let question = questionTest.questionRelation;
                let selectedAnswer;
                let isCorrect = false;
                let correctAnswer = '';

                if(questionTest.optionAnswerTypeId === 1  && question.optionTypeId === 1){

                    for (const answer of question.answers){
                        if(answer.id === Number(selectedOptionId)){
                            selectedAnswer = answer;
                            if(selectedAnswer.isCorrect === 1){
                                isCorrect = true;
                                totalScored += questionTest.mark
                            }
                        }
                        if (answer.isCorrect) {
                            correctAnswer = answer.content;
                        }
                    }

                }

                // checker for theory questions
                // if(questionTest.optionAnswerTypeId === 3 && question.optionTypeId === 3){
                //     // ai api for answer check
                //     const hints = question.hints;
                //     const isCorrect = await this.answerCheckService.checkTheoreticalAnswer(String(selectedOptionId), hints);

                //     if (isCorrect) {
                //         // Update the answer as correct
                //     } else {
                //         // Handle incorrect answer
                //     }
                // }

              
                // console.log(question);   
                console.log(`Question ID: ${question}, Selected Option ID: ${selectedOptionId}`);
                totalMarks += questionTest.mark
                questionTestIds.push(questionTest.id);

                const newScore = this.resultsScoreRepository.create({
                    resultId: 0, // Will be updated with actual result later
                    questionId: question.id,
                    questionTest,
                    test,
                    score: isCorrect ? questionTest.mark.toString() : '0',
                    scored: true,
                    studentAnswer: selectedAnswer ? selectedAnswer.content : '',
                    isCorrect,
                    correctAnswer,
                    result: null,
                });
                await this.resultsScoreRepository.save(newScore);

            } else {
              console.log(`Question with ID ${questionTestId} not found.`);
            }

            totalCount++;
        }
        console.log(selectedOptions, answers)
        console.log(test_id, 
            studentTestData.startExamDateTime, 
            studentTestData.endExamDateTime, 
            studentTestData.duration, 
            totalCount, 
            totalMarks, 
            totalScored, 
            questionTestIds)

        const payload = {
            student,
            testId: test_id, 
            startExamDateTime: studentTestData.startExamDateTime, 
            endExamDateTime: studentTestData.endExamDateTime, 
            duration: studentTestData.duration, 
            totalCount, 
            totalMarks, 
            totalScored, 
            questionTestIds,
            user,
            test
        }

        const savedResult = await this.saveStudentResult(payload);

        const resultScores = await this.resultsScoreRepository.find({where: { resultId : 0 }})
        for(const score of resultScores){
            score.resultId = savedResult.id;
            score.result = savedResult;
            await this.resultsScoreRepository.save(score);
        }



        // for (const [questionTestId, selectedOptionId] of Object.entries(selectedOptions)) {
        //     // Use await for your repository call
        //     const questionTest = await this.questionsTestRepository.findOne({
        //       where: {
        //         id: Number(questionTestId),
        //         testId: test.id,
        //       },
        //       relations: ['questionRelation', 'questionRelation.answers'],
        //     });
          
        //     if (questionTest) {
        //         let question = questionTest.questionRelation;
        //         let selectedAnswer;
        //         let isCorrect = false;
        //         let correctAnswer = '';


        //         //   let correctAnswer = question.answers.find((i) => i.isCorrect === i.isCorrect);
        //         for (const answer of question.answers){
        //             if(answer.id === Number(selectedOptionId)){
        //                 selectedAnswer = answer;
        //                 if(selectedAnswer.isCorrect === 1){
        //                     isCorrect = true;
        //                     totalScored += questionTest.mark
        //                 }
        //             }

        //             if (answer.isCorrect) {
        //                 correctAnswer = answer.content;
        //             }
        //         }

        //         // const newScore = this.resultsScoreRepository.create({
        //         //     resultId: savedResult.id, // Will be updated with actual result later
        //         //     questionId: question.id,
        //         //     questionTest,
        //         //     test,
        //         //     score: isCorrect ? questionTest.mark.toString() : '0',
        //         //     scored: true,
        //         //     studentAnswer: selectedAnswer ? selectedAnswer.content : '',
        //         //     isCorrect,
        //         //     correctAnswer,
        //         // });

        //         // await this.resultsScoreRepository.save(newScore);

        //     } else {
        //       console.log(`Question with ID ${questionTestId} not found.`);
        //     }

        // }

        
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

    async saveStudentResult(payload): Promise<any>{
        try {
            const newResult = this.resultRepository.create({
                student: payload.student,
                testId: payload.testId,
                startDate: payload.startExamDateTime,
                endDate: payload.endExamDateTime,
                serverEndDate: payload.endExamDateTime,
                duration: payload.duration,
                totalScored: payload.totalScored,
                totalCount: payload.totalCount,
                totalMarks: payload.totalMarks,
                questionTestIds: payload.questionTestIds,
                user : payload.user,
                test: payload.test,
            });
            const savedResult = await this.resultRepository.save(newResult);

            return savedResult;
        } catch (error) {
            console.error('Error saving student result:', error);
            throw new Error('Unable to save student result.');
        }
    }

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
            // console.log(err)
            return {
              error: 'error',
              message: 'An error occurred while sending project invites'
            }
        }

    }

    async getTestQuestions(testId: number): Promise<any> {
        try{
            const test = await this.testsRepository.findOne({ where : { id: testId} });
        
            if(!test) {
              return {
                error: 'error',
                message: 'Test not found'
              }
            }
        
            const questionTest = await this.questionsTestRepository.find({
                where: {
                    testId: test.id
                },
                relations: ['questionRelation', 'questionRelation.answers']
            });

            console.log(questionTest);
            return {
                success: true,
                data: questionTest,
            };
            
          } catch (err) {
            // console.log(err)
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
            // console.log( is_added.is_added === 0, is_added.is_added, question, existingEntry )
            // return;
            if( is_question_test_added === 1 ){
                if(!existingEntry){
                    const savedQuestionTest = await this.createQuestionTest(test, question, question); 
                    // console.log(savedQuestionTest, 'hereeeeeee');
                    // console.log(existingEntry)


                    // if(savedQuestionTest){
                    //     const updatedTestMark = test.totalMarks + Number(savedQuestionTest.mark);
                    //     const totalQuestions = test.totalQuestions + 1;
                    //     await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :updatedTestMark});
            
                    // } else{
                    //     return{
                    //         error: 'error',
                    //         message: 'An error occurred!'
                    //     }
                    // }
                    
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

                        // const savedUpdatedQuestion = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })
                        // const updatedTestMark = test.totalMarks + Number(savedUpdatedQuestion.mark);
                        // const totalQuestions = test.totalQuestions + 1;
                        // await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :updatedTestMark});
                
                    }

                    


                }

            if(is_question_test_added === 0 && existingEntry){
                // let updatedTestMark 
                // if(test.totalQuestions > 0){
                //     updatedTestMark = test.totalMarks - Number(existingEntry.mark);
                // }    
                // let totalQuestions = test.totalQuestions;
                // if(test.totalQuestions > 0){
                //     totalQuestions = test.totalQuestions -= 1;
                // }

                // await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :updatedTestMark});
                await this.questionsTestRepository.delete(existingEntry.id);

            }

            const questionTests = await this.questionsTestRepository.find({ where : { testId: test.id} })

            let totalmark = 0;
            let totalQuestions = 0;

            for(const test of questionTests){
                totalmark += test.mark;
                totalQuestions++;
            }
            const testUpdated = await this.testsRepository.update({ id : test.id }, { totalQuestions: totalQuestions, totalMarks :totalmark});
            if(testUpdated.affected < 1){
                return {
                    error:'error',
                    message: 'An error has occurred'
                }
            }


            // console.log(question, question.questionTest, test.id)
            const existingEntry2 = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })

            const questionData ={
                // ...question,
                
            }

            return {
                success: 'success',
                is_added: existingEntry2 ? true : false,
                message: 'Question Test updated successfully'
            }
            
            
            
        } catch (err) {
            // console.log(err)
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
        
            
            const mark = set_mark.mark;

            const existingEntry = await this.questionsTestRepository.findOne({ where : { questionId: questionId, testId: testId} })
            // if(!existingEntry){
            //     return {
            //         error: 'error',
            //         message: 'Question not found'
            //       }
            // }

            console.log(existingEntry, 'existinf')

            const updated =  await this.questionsTestRepository.update({ id : existingEntry.id }, {mark: Number(mark)});
            console.log(updated, 'updated')
            if(updated.affected < 1){
                return {
                    error: 'error',
                    message: 'An error occurred'
                  }
            }

            const questionTests = await this.questionsTestRepository.find({ where : { testId: testId} })

            let totalmark = 0;

            for(const test of questionTests){
                totalmark += test.mark;
            }

        //    const updatedTestMark = test.totalMarks + Number(mark);
        //    const totalQuestions = test.totalQuestions += Number(mark);
            await this.testsRepository.update({ id :test.id }, { totalMarks: totalmark});

           
        //    console.log(updated, 'updated')
            let data = {
                success: 'success',
                message: 'Question Test updated successfully',
            };
            return data;

        } catch (err){
            console.log(err)
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
