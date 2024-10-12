import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';
import { Question } from 'src/typeorm/entities/Question';

@Controller('questions')
export class QuestionsController {
    constructor(private questionService: QuestionsService) {}

    @Get('/')
    getQuestions() {
        return this.questionService.getAllQuestions();
    }

    @Get('/:id')
    getQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestionById(id);
    }
    @Get('/main/initial-data')
    getInitialData() {
        return this.questionService.getInitialData();
    }


    @Post('/create')
    createQuestion(@Body() questionData: Partial<Question>) {
        return this.questionService.createQuestion(questionData);
    }

    @Patch('/edit/:id')
    async partialUpdateQuestion(
        @Param('id', ParseIntPipe) id: number,
        @Body() questionData: Partial<Question>
    ) {
        return this.questionService.updateQuestion(id, questionData);
    }

    @Delete('/delete/:id')
    deleteQuestion(@Param('id', ParseIntPipe) id: number) {
        return this.questionService.deleteQuestion(id);
    }

    @Delete('/delete-answer/:id')
    deleteAnswer(@Param('id', ParseIntPipe) id: number) {
        return this.questionService.deleteAnswer(id);
    }
}
