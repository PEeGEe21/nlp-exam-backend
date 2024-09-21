import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';
import { Question } from 'src/typeorm/entities/Question';

@Controller('questions')
export class QuestionsController {
    constructor(private questionService: QuestionsService) {}

    @Get('/all')
    getQuestions() {
        return this.questionService.getAllQuestions();
    }

    @Get(':id')
    getQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestionById(id);
    }

    @Post('/create')
    createQuestion(@Body() questionData: Partial<Question>) {
        return this.questionService.createQuestion(questionData);
    }

    @Post(':id')
    deleteQuestion(@Param('id', ParseIntPipe) id: number) {
      return this.questionService.deleteQuestion(id);
    }
}
