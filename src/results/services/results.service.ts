import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyTypesService } from 'src/difficulty-types/services/difficulty-types.service';
import { OptionTypesService } from 'src/option-types/services/option-types.service';
import { Question } from 'src/typeorm/entities/Question';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { Result } from 'src/typeorm/entities/Result';
import { Student } from 'src/typeorm/entities/Student';
import { Test } from 'src/typeorm/entities/Test';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class ResultsService {
    constructor(

        private usersService: UsersService,
        private difficultyService: DifficultyTypesService,
        private optionService: OptionTypesService,

        @InjectRepository(Test) private testRepository: Repository<Test>,
        @InjectRepository(Question) private questionsRepository: Repository<Question>,
        @InjectRepository(QuestionTest) private questionTestRepository: Repository<QuestionTest>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Result) private resultsRepository: Repository<Result>,

    ) {}


    async getAllResults() {
        const results = await this.resultsRepository.find({relations:['user', 'test', 'student.user']});
        const res = {
            success: 'success',
            message: 'successful',
            data: results,
        };
        return res;
    }

    async getResultById(id: number): Promise<any | undefined> {
        try {
            const result = await this.resultsRepository.findOne({
                where: { id },
                relations: ['user', 'test', 'student'],
            });

            if (!result)
                throw new HttpException('Result not found', HttpStatus.BAD_REQUEST);
        
            let data = {
                result,
                success: 'success',
            };
            return data;

        } catch (err) {}
    }

    async getResultByTestId(test_id: number): Promise<any | undefined> {
        try {

            const test = await this.testRepository.findOne({where: {id: test_id}});
            if(!test){
                return{
                    error: 'error',
                    message: 'Test not found',
                }
            }

            // console.log(test)

            const results = await this.resultsRepository.find({ 
                where: { testId: test.id },
                relations: ['user', 'test', 'student', 'student.user'],
                order: {
                    createdAt: 'DESC',
                }
            });

            console.log(results, 'result');

            if (!results)
                throw new HttpException('Result not found', HttpStatus.BAD_REQUEST);
        
            let data = {
                results,
                success: 'success',
            };
            return data;

        } catch (err) {}
    }

    async getResultByStudentTestResult(result_id: number, test_id: number, student_id: number, ): Promise<any | undefined> {
        try {

            const test = await this.testRepository.findOne({where: {id: test_id}});
            if(!test){
                return{
                    error: 'error',
                    message: 'Test not found',
                }
            }
            
            const student = await this.studentRepository.findOne({where: {id: student_id}, relations: ['user']});
            if(!student){
                return{
                    error: 'error',
                    message: 'Test not found',
                }
            }

            console.log(test)

            const result = await this.resultsRepository.findOne({
                where: { id: result_id },
                // where: {test: test, student: student},
                relations: ['user', 'test', 'student', 'student.user', 'scores', 'scores.questionTest', 'scores.question', 'scores.question.difficulty', 'scores.question.answers', 'scores.question.hints'],
            });

            console.log(result);

            if (!result)
                throw new HttpException('Result not found', HttpStatus.BAD_REQUEST);
        
                  // Calculate the total scored and total marks.
            let totalScored = 0;
            let totalMarks = 0;

            result.scores.forEach((score) => {
                totalScored += parseFloat(score.score); // Ensure that score is a number.
                totalMarks += score.questionTest.mark; // Assuming 'maxMarks' exists on 'questionTest'.
            });

            // Calculate the percentage.
            let calc = (totalScored / totalMarks) * 100;
            const percentage = !calc ? 0 : calc;

            // Update the result with the calculated scores.
            // result.totalScored = totalScored;
            // result.totalMarks = totalMarks;
            // result.percentage = percentage; // Assuming you have a 'percentage' field on 'result'.
            // await this.resultsRepository.save(result);

            await this.resultsRepository.update({id: result_id}, {
                totalScored: totalScored,
                totalMarks: totalMarks,
            });

            delete student.user.password

            let data = {
                test,
                result,
                student,
                totalScored,
                totalMarks,
                percentage,
                success: 'success',
            };
            return data;

        } catch (err) {}
    }

    async deleteResult(id: number): Promise<any> {
        try {
            const result = await this.resultsRepository.findOne({
                where: { id },
            });
        
            if (!result) {
                return { error: 'error', message: 'Result not found' };
            }

            await this.resultsRepository.delete(id);
            return { success: 'success', message: 'Result deleted successfully' };

        } catch (err) {
                console.error('Error deleting Result:', err);
                throw new HttpException(
                    'Error deleting Result',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }
}
