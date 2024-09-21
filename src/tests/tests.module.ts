import { Module } from '@nestjs/common';
import { TestsController } from './controllers/tests.controller';
import { TestsService } from './services/tests.service';
import { UsersModule } from 'src/users/users.module';
import { DifficultyTypesModule } from 'src/difficulty-types/difficulty-types.module';
import { OptionTypesModule } from 'src/option-types/option-types.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Question } from 'src/typeorm/entities/Question';
import { Answer } from 'src/typeorm/entities/Answer';
import { OptionType } from 'src/typeorm/entities/OptionType';

@Module({
  imports: [
    UsersModule,
    DifficultyTypesModule,
    OptionTypesModule,
    TypeOrmModule.forFeature([User, DifficultyType, Question, Answer, OptionType])
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService]
})
export class TestsModule {}
