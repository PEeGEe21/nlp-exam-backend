import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DifficultyTypesModule } from 'src/difficulty-types/difficulty-types.module';
import { OptionTypesModule } from 'src/option-types/option-types.module';
import { Answer } from 'src/typeorm/entities/Answer';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { Profile } from 'src/typeorm/entities/Profile';
import { Question } from 'src/typeorm/entities/Question';
import { Student } from 'src/typeorm/entities/Student';
import { User } from 'src/typeorm/entities/User';
import { UsersModule } from 'src/users/users.module';
import { ResultsService } from './services/results.service';
import { ResultsController } from './controllers/results.controller';
import { QuestionsModule } from 'src/questions/questions.module';
import { QuestionTest } from 'src/typeorm/entities/QuestionTest';
import { Test } from 'src/typeorm/entities/Test';
import { TestsModule } from 'src/tests/tests.module';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { Result } from 'src/typeorm/entities/Result';

@Module({
    imports: [
        UsersModule,
        DifficultyTypesModule,
        OptionTypesModule,
        QuestionsModule,
        TestsModule,
        TypeOrmModule.forFeature([User, Profile, Question, Answer, OptionType, Student, QuestionTest, Test, Result])
    ],
    providers: [ResultsService, SanitizerService],
    controllers: [ResultsController],
    exports: [ResultsService],
})
export class ResultsModule {}
