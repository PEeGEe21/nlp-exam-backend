import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { UsersModule } from 'src/users/users.module';
import { DifficultyTypesController } from './controllers/difficulty-types.controller';
import { DifficultyTypesService } from './services/difficulty-types.service';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { SeederService } from 'src/seeder/seeder.service';
import { Question } from 'src/typeorm/entities/Question';
import { Answer } from 'src/typeorm/entities/Answer';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { OptionTypesModule } from 'src/option-types/option-types.module';

@Module({
    imports: [
      UsersModule,
      TypeOrmModule.forFeature([User, Profile, DifficultyType, Answer, Question, OptionType])
    ],
    controllers: [DifficultyTypesController],
    providers: [DifficultyTypesService],
    exports: [DifficultyTypesService],
  })  
export class DifficultyTypesModule {}
