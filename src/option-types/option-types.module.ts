import { Module } from '@nestjs/common';
import { OptionTypesService } from './services/option-types.service';
import { OptionTypesController } from './controllers/option-types.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Answer } from 'src/typeorm/entities/Answer';
import { Question } from 'src/typeorm/entities/Question';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { DifficultyTypesModule } from 'src/difficulty-types/difficulty-types.module';
import { SeederService } from 'src/seeder/seeder.service';
import { DifficultyTypesService } from 'src/difficulty-types/services/difficulty-types.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Profile, DifficultyType, Answer, Question, OptionType])
  ],
  providers: [OptionTypesService],
  controllers: [OptionTypesController],
  exports: [OptionTypesService],
})
export class OptionTypesModule {}
