import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Profile } from 'src/typeorm/entities/Profile';
import { Question } from 'src/typeorm/entities/Question';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(DifficultyType) private difficultyRepository: Repository<DifficultyType>,
        @InjectRepository(Question) private questions: Repository<Question>,

    ) {}

    async getAllQuestions() {
        const all_questions = await this.questions.find();
    
        const res = {
            success: 'success',
            message: 'successful',
            data: all_questions,
        };

        return res;
    }
}
