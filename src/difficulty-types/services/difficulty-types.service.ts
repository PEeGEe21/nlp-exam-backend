import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyType } from 'src/typeorm/entities/DifficultyType';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class DifficultyTypesService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>,
        @InjectRepository(DifficultyType) private difficultyRepository: Repository<DifficultyType>,
    
      ) {}
    async findDifficulties() {
        const difficulties = await this.difficultyRepository.find();
    
        const res = {
          success: 'success',
          message: 'successful',
          data: difficulties,
        };

        return res;
      }
}
