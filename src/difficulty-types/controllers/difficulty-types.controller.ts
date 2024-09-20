import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DifficultyTypesService } from '../services/difficulty-types.service';

@Controller('difficulty-types')
export class DifficultyTypesController {
    constructor(private difficultyTypesService: DifficultyTypesService) {}

    @Get('/')
    getTasks() {
      return this.difficultyTypesService.findDifficulties();
    }
}
