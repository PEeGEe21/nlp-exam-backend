import { Controller, Get } from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(private questionService: QuestionsService) {}

    @Get('/all')
    getQuestions() {
        return this.questionService.getAllQuestions();
    }
}
