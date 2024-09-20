import { Module } from '@nestjs/common';
import { TestsController } from './controllers/tests.controller';
import { TestsService } from './services/tests.service';

@Module({
  controllers: [TestsController],
  providers: [TestsService]
})
export class TestsModule {}
