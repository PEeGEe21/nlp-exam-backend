import {
  IsDate,
  IsDateString,
  IsEmail,
  IsIn,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SaveStudentTestDto {
  @IsString()
  @IsNotEmpty()
  answers: string;

  @IsNumber()
  user_id: number;

  @IsDateString()
  endExamDateTime: string;

  @IsDateString()
  startExamDateTime: string;

  @IsNumber()
  duration: number;
}