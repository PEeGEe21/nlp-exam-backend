import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OptionType } from 'src/typeorm/entities/OptionType';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class OptionTypesService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(OptionType) private optionRepository: Repository<OptionType>,

      ) {}

    async findDifficulties() {
        const difficulties = await this.optionRepository.find();

        const res = {
            success: 'success',
            message: 'successful',
            data: difficulties,
        };

        return res;
    }

    async getOptionTypeById(id: number): Promise<any | undefined> {
        try {
          const project = await this.optionRepository.findOneBy({ id });
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
