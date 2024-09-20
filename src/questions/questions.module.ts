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

@Module({
  imports: [
    UsersModule,
    DifficultyTypesModule,
    TypeOrmModule.forFeature([User, Profile, DifficultyType, Question])
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController]
})
export class QuestionsModule {}
