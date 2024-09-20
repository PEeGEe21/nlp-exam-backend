import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OptionTypesService } from '../services/option-types.service';

@Controller('option-types')
export class OptionTypesController {
    constructor(private optionTypesService: OptionTypesService) {}
    @Get('/')
    getTasks() {
      return this.optionTypesService.findDifficulties();
    }

    @Get(':id')
    getOptionType(@Param('id', ParseIntPipe) id: number) {
        return this.optionTypesService.getOptionTypeById(id);
    }
}
