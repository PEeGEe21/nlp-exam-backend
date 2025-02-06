import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { OptionTypesService } from '../services/option-types.service';

@Controller('option-types')
export class OptionTypesController {
    constructor(private optionTypesService: OptionTypesService) {}
    @Get('/')
    getTasks() {
      return this.optionTypesService.findDifficulties();
    }

    @Post()
    create(@Body() createOptionDto: any) {
        return this.optionTypesService.create(createOptionDto);
    }

    @Get(':id')
    getOptionType(@Param('id', ParseIntPipe) id: number) {
        return this.optionTypesService.getOptionTypeById(id);
    }

    @Post('/update-status/:type_id')
    async updateUserStatus(
        @Param('type_id', ParseIntPipe) type_id: number,
    ): Promise<any> {
        return this.optionTypesService.updateOptionTypeStatus(type_id);
    }

    @Post('/update-type/:id')
    update(@Param('id') id: number, @Body() updateTypeDto: any) {
        return this.optionTypesService.update(+id, updateTypeDto);
    }

}
