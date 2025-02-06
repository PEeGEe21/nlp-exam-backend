import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { DifficultyTypesService } from 'src/difficulty-types/services/difficulty-types.service';
import { OptionTypesService } from 'src/option-types/services/option-types.service';
import { Answer } from 'src/typeorm/entities/Answer';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Hint } from 'src/typeorm/entities/Hint';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { Question } from 'src/typeorm/entities/Question';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsService {
    constructor(

        private usersService: UsersService,
        private difficultyService: DifficultyTypesService,
        private optionService: OptionTypesService,
        private readonly sanitizerService: SanitizerService,


        @InjectRepository(DifficultyType) private difficultyRepository: Repository<DifficultyType>,
        @InjectRepository(Question) private questionsRepository: Repository<Question>,
        @InjectRepository(QuestionTest) private questionsTestRepository: Repository<QuestionTest>,
        @InjectRepository(Answer) private answersRepository: Repository<Answer>,
        @InjectRepository(Hint) private hintsRepository: Repository<Hint>,
        @InjectRepository(OptionType) private readonly optionTypeRepository: Repository<OptionType>,

    ) {}

    async getAllQuestions() {
        const all_questions = await this.questionsRepository.find({relations:['answers', 'difficulty', 'optionType']});
    
        const res = {
            success: 'success',
            message: 'successful',
            data: all_questions,
        };

        return res;
    }

    async getInitialData() {
        const optionTypes = await this.optionTypeRepository.find({where: {is_active: true}});
        const difficulties = await this.difficultyRepository.find({where: {is_active: true}});
    
        const res = {
            success: 'success',
            message: 'successful',
            optionTypes,
            difficulties,
        };

        return res;
    }

    async getQuestionById(id: number): Promise<any | undefined> {
        try {
            const question = await this.questionsRepository.findOne({
                where: { id },
                relations: ['answers', 'difficulty', 'optionType', 'hints'],
            });

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
        // console.log(questionData)
        // return;
        const user = await this.usersService.getUserAccountById(questionData.userId)

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const difficultyType = await this.difficultyService.getDifficultyById(questionData.difficultyId)
        if (!difficultyType) {
            throw new NotFoundException('DifficultyType not found');
        }

        const optionType = await this.optionService.getOptionTypeById(questionData.optionTypeId)
        if (!optionType) {
            throw new NotFoundException('OptionType not found');
        }

        // console.log(optionType, difficultyType)
        const sanitizedQuestion = this.sanitizerService.sanitizeInput(questionData.question);

        // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
        // return;

        try{
            const newQuestion = this.questionsRepository.create({
                userId: user.id,
                difficultyId: difficultyType.difficulty.id,
                optionTypeId: optionType.optionType.id,
                isEditor: null,
                question: questionData.question,
                questionPlain: sanitizedQuestion??null,
                marks: questionData.marks??Number(0),
                instruction: null,
                showHints: questionData.showHints,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(newQuestion, 'newQuestion')
            const saveNewQuestion = await this.questionsRepository.save(newQuestion);
            if (questionData.answers){
                await this.createAnswers(questionData, saveNewQuestion);
            }
            if (questionData.hints){
                await this.createHints(questionData, saveNewQuestion);
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

    async createHints(data, question){
        for (const hint of data.hints) {
            const newHint = this.hintsRepository.create({
                question: question,
                content: hint.content,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await this.hintsRepository.save(newHint);
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

            const sanitizedQuestion = this.sanitizerService.sanitizeInput(questionData.question);

            const updatedFields: Record<string, any> = Object.keys(questionData).reduce((acc, key) => {
                if (key !== 'answers' && key !== 'hints' && questionData[key] !== undefined) {
                    acc[key] = questionData[key];
                }
                return acc;
            }, {});

            updatedFields.questionPlain = sanitizedQuestion??null

            const saveNewQuestion = await this.questionsRepository.update({ id }, updatedFields);
            const questionTest = await this.questionsTestRepository.findOne({
                where: { questionId: question.id },
            });
            // const saveNewQuestion = await this.questionsRepository.update(
            //     { id },
            //     {   
            //         difficultyId: questionData.difficultyId,
            //         optionTypeId: questionData.optionTypeId,
            //         question: questionData.question,
            //     },
            // ); 
    
            if(saveNewQuestion.affected == 1){
                if (questionData.answers) {
    
                    for (const answerData of questionData.answers) {
                        if(answerData.id > 0){
                            const existingAnswer =  await this.answersRepository.findOne({
                                where: { id : answerData.id},
                            });
                            if (existingAnswer) {
                                const id = answerData.id;
                                await this.answersRepository.update({id}, {
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

                if (questionData.hints) {
    
                    for (const hintData of questionData.hints) {
                        if(hintData.id > 0){
                            const existingHint =  await this.hintsRepository.findOne({
                                where: { id : hintData.id},
                            });
                            if (existingHint) {
                                const id = hintData.id;
                                await this.hintsRepository.update({id}, {
                                    content: hintData.content,
                                });
                            } else {
                                throw new NotFoundException('Answer not found');
                            }
                        } else{    
                            const newHint = this.hintsRepository.create({
                                question: question,
                                content: hintData.content,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            });
                            await this.hintsRepository.save(newHint);
                        }
                    }
                }


                const updatedQuestions = await this.questionsRepository.findOne({
                    where: { id },
                    relations: ['answers'],
                });
            
                console.log(questionTest)
                if(questionTest){
                    let question_test_id = Number(questionTest.id);
                    const updatedQuestionTest = {
                        question: updatedQuestions.question,
                        optionAnswerTypeId: updatedQuestions.optionTypeId
                    }
                    const updated = await this.questionsTestRepository.update({ id:question_test_id }, updatedQuestionTest);
                    console.log(updated, updatedQuestionTest)
                }

                let data = {
                    success: 'success',
                    message: 'Question updated successfully',
                    data: updatedQuestions,
                };
                return data;
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
                    HttpStatus.INTERNAL_SERVER_ERROR
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
