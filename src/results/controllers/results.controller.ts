import { Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    ParseIntPipe, 
    Patch, 
    Post, 
    Put 
} from '@nestjs/common';
import { ResultsService } from '../services/results.service';
import { Result } from 'src/typeorm/entities/Result';

@Controller('results')
export class ResultsController {
    constructor(private resultsService: ResultsService) {}
    @Get('/')
    getTests() {
        return this.resultsService.getAllResults();
    }

    @Get('/:id')
    getResult(@Param('id', ParseIntPipe) id: number) {
        return this.resultsService.getResultById(id);
    }
    @Get('/test/:test_id')
    getResultByTestId(@Param('test_id', ParseIntPipe) test_id: number) {
        return this.resultsService.getResultByTestId(test_id);
    }
    @Get('/scores/:result_id/:test_id/:student_id')
    getResultByStudentTestResult(
        @Param('result_id', ParseIntPipe) result_id: number,
        @Param('test_id', ParseIntPipe) test_id: number,
        @Param('student_id', ParseIntPipe) student_id: number
    ) {
        return this.resultsService.getResultByStudentTestResult(result_id, test_id, student_id);
    }


    // @Post('/create')
    // createTest(@Body() testData: Partial<Result>) {
    //     return this.resultsService.createTest(testData);
    // }

    @Delete('/delete/:id')
    deleteResult(@Param('id', ParseIntPipe) id: number) {
        return this.resultsService.deleteResult(id);
    }
}
