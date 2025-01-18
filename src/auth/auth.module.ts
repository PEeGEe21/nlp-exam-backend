import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './contollers/auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'src/config';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { Student } from 'src/typeorm/entities/Student';
import { UsersService } from 'src/users/services/users.service';
import { Question } from 'src/typeorm/entities/Question';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Test } from 'src/typeorm/entities/Test';
import { Result } from 'src/typeorm/entities/Result';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      global: true,
      secret: config.secret,
      signOptions: {
        expiresIn: config.expires, // 1 week
      },
    }),
    TypeOrmModule.forFeature([User, Profile, Student, DifficultyType, Question, Test, Student, Result]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  exports: [AuthService]
})
export class AuthModule {}
