import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    async getProjectById(id: number): Promise<any | undefined> {
        try {
          const project = await this.difficultyRepository.findOneBy({ id });
          if (!project)
            throw new HttpException('Project not found', HttpStatus.BAD_REQUEST);
    
          let data = {
            project,
            success: 'success',
          };
          return data;
        } catch (err) {}
      }
}
