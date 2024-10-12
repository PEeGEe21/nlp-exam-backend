import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestsController } from './controllers/tests.controller';
import { TestsService } from './services/tests.service';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Question } from 'src/typeorm/entities/Question';
import { DifficultyTypesModule } from 'src/difficulty-types/difficulty-types.module';
import { QuestionsModule } from 'src/questions/questions.module';
import { OptionTypesModule } from 'src/option-types/option-types.module';
import { UsersModule } from 'src/users/users.module';
import { Answer } from 'src/typeorm/entities/Answer';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { Test } from 'src/typeorm/entities/Test';
import { Student } from 'src/typeorm/entities/Student';
import { Result } from 'src/typeorm/entities/Result';
import { ResultsScore } from 'src/typeorm/entities/ResultsScore';

@Module({
  imports: [
    UsersModule,
    QuestionsModule,
    DifficultyTypesModule,
    OptionTypesModule,
    TypeOrmModule.forFeature([User, Profile, DifficultyType, Question, Answer, OptionType, QuestionTest, Test, Student, Result, ResultsScore])
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService]
})
export class TestsModule {}
