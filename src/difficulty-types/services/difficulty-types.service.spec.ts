import { Test, TestingModule } from '@nestjs/testing';
import { DifficultyTypesService } from './difficulty-types.service';

describe('DifficultyTypesService', () => {
  let service: DifficultyTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DifficultyTypesService],
    }).compile();

    service = module.get<DifficultyTypesService>(DifficultyTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
