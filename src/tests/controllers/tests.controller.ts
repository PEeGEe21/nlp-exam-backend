import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { TestsService } from '../../tests/services/tests.service';
import { Test } from 'src/typeorm/entities/Test';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { SaveStudentTestDto } from '../dtos/save-student-test.dto';

@Controller('tests')
export class TestsController {
    constructor(private testsService: TestsService) {}

    @Get('/')
    getTests() {
        return this.testsService.getAllTests();
    }

    @Get('/student')
    getAllStudentTests() {
        return this.testsService.getAllStudentTests();
    }

    @Get('/:id')
    getTest(@Param('id', ParseIntPipe) id: number) {
      return this.testsService.getTestById(id);
    }

    @Get('/:id/questions')
    getTestQuestions(@Param('id', ParseIntPipe) id: number) {
      return this.testsService.getTestQuestions(id);
    }

    @Post('/create')
    createTest(@Body() testData: Partial<Test>) {
        return this.testsService.createTest(testData);
    }

    @Post('/:id/submit')
    async saveStudentTest(
      @Param('id', ParseIntPipe) id: number,
      @Body() studentTestData: SaveStudentTestDto
    ): Promise<any> {
        return this.testsService.saveStudentTest(id, studentTestData);
    }

    @Post('/add-question-to-test/:testId/:questionId')
    getTasks(
      @Param('testId', ParseIntPipe) testId: number,
      @Param('questionId', ParseIntPipe) questionId: number,
      @Body() is_added: any,
    ) {
      return this.testsService.addQuestionTest(testId, questionId, is_added);
    }

    @Post('/:testId/:questionId/mark')
    addTestQuestionMark(
      @Param('testId', ParseIntPipe) testId: number,
      @Param('questionId', ParseIntPipe) questionId: number,
      @Body() mark: any,
    ) {
      return this.testsService.addTestQuestionMark(testId, questionId, mark);
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
