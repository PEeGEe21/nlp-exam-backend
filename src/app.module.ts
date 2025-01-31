import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './typeorm/entities/User';
import { Profile } from './typeorm/entities/Profile';
import { config } from './config';
import { QuestionsModule } from './questions/questions.module';
import { TestsModule } from './tests/tests.module';
import { Test } from './typeorm/entities/Test';
import { Question } from './typeorm/entities/Question';
import { QuestionTest } from './typeorm/entities/QuestionTest';
import { Result } from './typeorm/entities/Result';
import { ResultsScore } from './typeorm/entities/ResultsScore';
import { Student } from './typeorm/entities/Student';
import { OptionType } from './typeorm/entities/OptionType';
import { DifficultyType } from './typeorm/entities/DifficultyType';
import { ResultsService } from './results/services/results.service';
import { ResultsController } from './results/controllers/results.controller';
import { ResultsModule } from './results/results.module';
import { DifficultyTypesController } from './difficulty-types/controllers/difficulty-types.controller';
import { DifficultyTypesService } from './difficulty-types/services/difficulty-types.service';
import { DifficultyTypesModule } from './difficulty-types/difficulty-types.module';
import { SeederService } from './seeder/seeder.service';
import { Answer } from './typeorm/entities/Answer';
import { OptionTypesModule } from './option-types/option-types.module';
import { SanitizerService } from './core/utils/SanitizerService';
import { AnswerCheckService } from './core/utils/AnswerCheckService';
import { AuthService } from './auth/services/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port:  Number(process.env.DATABASE_PORT),
      username:  process.env.DATABASE_USERNAME,
      password:  process.env.DATABASE_PASSWORD,
      database:  process.env.DATABASE_NAME,
      timezone: 'Z', // Add this line for UTC
      ssl: { rejectUnauthorized: false },
      // entities: [__dirname + '/**/entity/*.entity{.ts,.js}'], 

      entities: [User, Profile, Test, Question, QuestionTest, Result, ResultsScore, Student, OptionType, DifficultyType, Answer],
      synchronize: true,
      autoLoadEntities:true,
      extra: {
        timezone: '+00:00'
      }
    }),
    TypeOrmModule.forFeature([User, Profile, DifficultyType, Question, Result, QuestionTest, ResultsScore, Test, Student, OptionType, DifficultyType, Answer]), // Ensure Role is added here
    AuthModule, 
    HttpModule,
    UsersModule, QuestionsModule, TestsModule, ResultsModule, DifficultyTypesModule, OptionTypesModule
  ],
  controllers: [AppController],
  providers: [AppService, SeederService, SanitizerService, AnswerCheckService, AuthService],
})
export class AppModule {}
