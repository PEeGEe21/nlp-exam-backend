import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Question } from 'src/typeorm/entities/Question';
import { Student } from 'src/typeorm/entities/Student';
import { Result } from 'src/typeorm/entities/Result';
import { TestsModule } from 'src/tests/tests.module';
import { Test } from 'src/typeorm/entities/Test';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // TestsModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, Profile, DifficultyType, Question, Test, Student, Result])
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
