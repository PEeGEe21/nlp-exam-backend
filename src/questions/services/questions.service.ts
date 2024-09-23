import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyTypesService } from 'src/difficulty-types/services/difficulty-types.service';
import { OptionTypesService } from 'src/option-types/services/option-types.service';
import { Answer } from 'src/typeorm/entities/Answer';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { Question } from 'src/typeorm/entities/Question';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsService {
    constructor(

        private usersService: UsersService,
        private difficultyService: DifficultyTypesService,
        private optionService: OptionTypesService,

        @InjectRepository(DifficultyType) private difficultyRepository: Repository<DifficultyType>,
        @InjectRepository(Question) private questionsRepository: Repository<Question>,
        @InjectRepository(Answer) private answersRepository: Repository<Answer>,
        @InjectRepository(OptionType) private readonly optionTypeRepository: Repository<OptionType>,

    ) {}

    async getAllQuestions() {
        const all_questions = await this.questionsRepository.find();
    
        const res = {
            success: 'success',
            message: 'successful',
            data: all_questions,
        };

        return res;
    }

    async getQuestionById(id: number): Promise<any | undefined> {
        try {
            const question = await this.questionsRepository.findOneBy({ id });
            if (!question)
                throw new HttpException('Question not found', HttpStatus.BAD_REQUEST);
        
            let data = {
                question,
                success: 'success',
            };
            return data;
        } catch (err) {}
    }

    async createQuestion(questionData: Partial<Question>): Promise<any> {
        const user = await this.usersService.getUserAccountById(questionData.userId)
        const difficultyType = await this.difficultyService.getProjectById(questionData.difficultyId)
        const optionType = await this.optionService.getOptionTypeById(questionData.optionTypeId)
        try{
            const newQuestion = this.questionsRepository.create({
                userId: user.id,
                difficultyId: difficultyType.project.id,
                optionTypeId: optionType.project.id,
                isEditor: null,
                question: questionData.question,
                questionPlain: null,
                marks: questionData.marks??Number(0),
                instruction: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(newQuestion, 'newQuestion')
            const saveNewQuestion = await this.questionsRepository.save(newQuestion);
            if (questionData.answers){
                await this.createAnswers(questionData, saveNewQuestion);
            }
            console.log(`Question ${questionData.question} has been created`);
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

    async createAnswers(data, question){
        for (const answer of data.answers) {
            const newAnswer = this.answersRepository.create({
                question: question,
                isCorrect: answer.isCorrect ? 1 : 0,
                content: answer.content,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await this.answersRepository.save(newAnswer);
        }
    }

    async updateQuestion(id: number, questionData: Partial<Question>): Promise<any> {
        try{
            const question = await this.questionsRepository.findOne({ 
                where: { id },
                relations: ['answers'],
            });
    
            if (!question) {
                throw new NotFoundException('Question not found');
            }
    
            const saveNewQuestion = await this.questionsRepository.update(
                { id },
                {   
                    difficultyId: questionData.difficultyId,
                    optionTypeId: questionData.optionTypeId,
                    question: questionData.question,
                },
            ); 
    
            if(saveNewQuestion.affected == 1){
                if (questionData.answers) {
    
                    for (const answerData of questionData.answers) {
                        if(answerData.id){
                            const existingAnswer =  await this.answersRepository.findOne({
                                where: { id : answerData.id},
                            });
                            if (existingAnswer) {
                                const id = answerData.id;
                                const newAnswer = this.answersRepository.update({id}, {
                                    isCorrect: answerData.isCorrect ? 1 : 0,
                                    content: answerData.content,
                                });
                            } else {
                                throw new NotFoundException('Answer not found');
                            }
                        } else{
                            // await this.createAnswers(answerData, question)
    
                            const newAnswer = this.answersRepository.create({
                                question: question,
                                isCorrect: answerData.isCorrect ? 1 : 0,
                                content: answerData.content,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            });
                            await this.answersRepository.save(newAnswer);
                        }
                    }
                }
                const updatedQuestions = await this.questionsRepository.findOne({
                    where: { id },
                    relations: ['answers'],
                });
            
                return {
                    success: 'success',
                    message: 'Question updated successfully',
                    data: updatedQuestions,
                };
            } else{
                return { error: 'error', message: 'An error occurred'};
            }
        } catch (err){
            let data = {
                error: err.message,
            };
            return data;
        }

    }

    async deleteQuestion(id: number): Promise<any> {
        try {
            const question = await this.questionsRepository.findOne({
                where: { id },
                relations: ['answers'],
            });
        
            if (!question) {
                return { error: 'error', message: 'Question not found' };
            }

            if (question.answers && question.answers.length > 0) {
                await this.answersRepository.delete({ question: { id } });
            }
        
            await this.questionsRepository.delete(id);
            return { success: 'success', message: 'Question deleted successfully' };

        } catch (err) {
                console.error('Error deleting Question:', err);
                throw new HttpException(
                    'Error deleting Question',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }

    async deleteAnswer(id: number): Promise<any> {
        try {
            const answer = await this.answersRepository.findOne({
                where: { id },
            });
        
            if (!answer) {
                return { error: 'error', message: 'Answer not found' };
            }

            await this.answersRepository.delete(id);
                    return { success: 'success', message: 'Answer deleted successfully' };

        } catch (err) {
                console.error('Error deleting Answer:', err);
                throw new HttpException(
                    'Error deleting Answer',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }
}
