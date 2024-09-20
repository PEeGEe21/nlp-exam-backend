import { Test, TestingModule } from '@nestjs/testing';
import { DifficultyTypesController } from './difficulty-types.controller';

describe('DifficultyTypesController', () => {
  let controller: DifficultyTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DifficultyTypesController],
    }).compile();

    controller = module.get<DifficultyTypesController>(DifficultyTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
