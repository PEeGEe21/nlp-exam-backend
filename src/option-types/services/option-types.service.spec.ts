import { Test, TestingModule } from '@nestjs/testing';
import { OptionTypesService } from './option-types.service';

describe('OptionTypesService', () => {
  let service: OptionTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionTypesService],
    }).compile();

    service = module.get<OptionTypesService>(OptionTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
