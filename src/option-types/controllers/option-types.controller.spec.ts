import { Test, TestingModule } from '@nestjs/testing';
import { OptionTypesController } from './option-types.controller';

describe('OptionTypesController', () => {
  let controller: OptionTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OptionTypesController],
    }).compile();

    controller = module.get<OptionTypesController>(OptionTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
  