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

      async create(optionData: any): Promise<any> {
        try{
            const entryFields = {
                title: optionData.title,
                description: optionData.description,
            }

            const newOption = this.optionRepository.create(entryFields);
            const savedNewOption = await this.optionRepository.save(newOption);

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
          const optionType = await this.optionRepository.findOneBy({ id });
          if (!optionType)
            throw new HttpException('Project not found', HttpStatus.BAD_REQUEST);
    
          let data = {
            optionType,
            success: 'success',
          };
          return data;
        } catch (err) {}
    }

    async update(id: number, updateTypeDto: any) {
      try{
      
          const updatedFields = {
              title: updateTypeDto.name,
              description: updateTypeDto.description,              
          }
  
          const update = await this.optionRepository.update({ id }, updatedFields);
      
          if(update.affected < 1){
              return {
                  error:'error',
                  message: 'An error has occurred'
              }
          }
  
          const newType = await this.optionRepository.findOne({where:{ id }});
      
          
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

    async updateOptionTypeStatus(type_id: number){
      try{
          const option_type = await this.optionRepository.findOneBy({ id: type_id });
          if(!option_type)
              return{
                  error: 'error',
                  message: 'Type not found'
              }

          let status = !option_type.is_active;
          await this.optionRepository.update({ id: option_type.id }, {is_active: status});

          const data = {
              success: 'success',
              message: 'Status updated successfully',
          }
          return data;


      } catch(err){

      }
  }
}
