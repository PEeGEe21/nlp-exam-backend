import { Module } from '@nestjs/common';
import { QuestionsService } from './services/questions.service';
import { QuestionsController } from './controllers/questions.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Question } from 'src/typeorm/entities/Question';
import { DifficultyTypesModule } from 'src/difficulty-types/difficulty-types.module';
import { Answer } from 'src/typeorm/entities/Answer';
import { SeederService } from 'src/seeder/seeder.service';
import { OptionTypesModule } from 'src/option-types/option-types.module';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { Hint } from 'src/typeorm/entities/Hint';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';

@Module({
  imports: [
    UsersModule,
    DifficultyTypesModule,
    OptionTypesModule,
    TypeOrmModule.forFeature([User, Profile, DifficultyType, Question, Answer, OptionType, Hint, QuestionTest])
  ],
  providers: [QuestionsService, SanitizerService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}
