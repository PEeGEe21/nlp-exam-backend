import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { TestsService } from '../../tests/services/tests.service';
import { Test } from 'src/typeorm/entities/Test';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';

@Controller('tests')
export class TestsController {
    constructor(private testsService: TestsService) {}

    @Get('/')
    getTests() {
        return this.testsService.getAllTests();
    }

    @Get('/:id')
    getTest(@Param('id', ParseIntPipe) id: number) {
    return this.testsService.getTestById(id);
    }

    @Post('/create')
    createTest(@Body() testData: Partial<Test>) {
        return this.testsService.createTest(testData);
    }

    @Post('/add-question-to-test/:testId/:questionId')
    getTasks(
      @Param('testId', ParseIntPipe) testId: number,
      @Param('questionId', ParseIntPipe) questionId: number,
      @Body() is_added: any,
    ) {
      return this.testsService.addQuestionTest(testId, questionId, is_added);
    }

    @Get('/question-assign-index/:testId')
    getQuestionTestsAssign(
      @Param('testId', ParseIntPipe) testId: number,
    ) {
      return this.testsService.getQuestionTestsAssign(testId);
    }

    @Patch('/edit/:id')
    async partialUpdateQuestion(
        @Param('id', ParseIntPipe) id: number,
        @Body() testData: Partial<Test>
    ) {
        return this.testsService.updateTest(id, testData);
    }

    @Delete('/delete/:id')
    deleteQuestion(@Param('id', ParseIntPipe) id: number) {
        return this.testsService.deleteTest(id);
    }
}
