import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DifficultyTypesService } from '../services/difficulty-types.service';

@Controller('difficulty-types')
export class DifficultyTypesController {
    constructor(private difficultyTypesService: DifficultyTypesService) {}

    @Get('/')
    getTasks() {
      return this.difficultyTypesService.findDifficulties();
    }

    @Get(':id')
    getDifficultyById(@Param('id', ParseIntPipe) id: number) {
    return this.difficultyTypesService.getDifficultyById(id);
  }

  @Post()
  create(@Body() createOptionDto: any) {
      return this.difficultyTypesService.create(createOptionDto);
  }

  @Post('/update-status/:type_id')
  async updateUserStatus(
      @Param('type_id', ParseIntPipe) type_id: number,
  ): Promise<any> {
      return this.difficultyTypesService.updateDifficultyTypeStatus(type_id);
  }

  @Post('/update-type/:id')
  update(@Param('id') id: number, @Body() updateTypeDto: any) {
      return this.difficultyTypesService.update(+id, updateTypeDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: number) {
      return this.difficultyTypesService.remove(+id);
  }

}
