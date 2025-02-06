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

    async getDifficultyById(id: number): Promise<any | undefined> {
        try {
          const difficulty = await this.difficultyRepository.findOneBy({ id });
          if (!difficulty)
            throw new HttpException('Project not found', HttpStatus.BAD_REQUEST);
    
          let data = {
            difficulty,
            success: 'success',
          };
          return data;
        } catch (err) {}
      }

      async create(optionData: any): Promise<any> {
        try{
            const entryFields = {
                title: optionData.title,
                description: optionData.description,
            }

            const newOption = this.difficultyRepository.create(entryFields);
            const savedNewOption = await this.difficultyRepository.save(newOption);

            let data = {
                success: 'success',
                option: savedNewOption,
            };
            return data;
  
        } catch (err) {
            let data = {
                error: err.message,
            };
            return data;
        }
    };

    async update(id: number, updateTypeDto: any) {
      try{
      
          const updatedFields = {
              title: updateTypeDto.name,
              description: updateTypeDto.description,              
          }
  
          const update = await this.difficultyRepository.update({ id }, updatedFields);
      
          if(update.affected < 1){
              return {
                  error:'error',
                  message: 'An error has occurred'
              }
          }
  
          const newType = await this.difficultyRepository.findOne({where:{ id }});
      
          
          let data = {
              success: 'success',
              type: newType,
          };
          return data;
  
      } catch (err) {
          let data = {
              error: err.message,
          };
          return data;
      }
    }

    async remove(id: number) {
      try {
          const type = await this.difficultyRepository.findOne({
              where: { id },
          });
      
          if (!type) {
              return { error: 'error', message: 'Difficulty not found' };
          }
  
          await this.difficultyRepository.delete(id);
          return { success: 'success', message: 'Difficulty deleted successfully' };
  
      } catch (err) {
              console.error('Error deleting Difficulty:', err);
              throw new HttpException(
                  'Error deleting Difficulty',
                  HttpStatus.INTERNAL_SERVER_ERROR,
              );
      }
  }

    async updateDifficultyTypeStatus(type_id: number){
      try{
          const option_type = await this.difficultyRepository.findOneBy({ id: type_id });
          if(!option_type)
              return{
                  error: 'error',
                  message: 'Type not found'
              }

          let status = !option_type.is_active;
          await this.difficultyRepository.update({ id: option_type.id }, {is_active: status});

          const data = {
              success: 'success',
              message: 'Status updated successfully',
          }
          return data;


      } catch(err){

      }
  }

}
