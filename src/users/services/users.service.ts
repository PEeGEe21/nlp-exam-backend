import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';

// export type User = any;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>,        
    ) {}
      
    // async findOne(username: string): Promise<User | undefined> {
    //     return this.users.find(user => user.username === username);
    // }

    async getUserAccountByEmail(email: string) {
        // const user = this.users.find(user => user.email === email);
        const user = await this.userRepository.findOneBy({ email });    
        return user;
    }
    async getUserAccountById(id: number) {
        const user = await this.userRepository.findOneBy({ id });    
        return user;
    }

    async getUserAccountPassword(email: string): Promise<string | undefined> {
        const user = await this.userRepository.findOneBy({ email });
        return user?.password;
    }
    
    async checkUserAccountEmailExists(email: string): Promise<boolean> {
        const user = await this.getUserAccountByEmail(email);
        if (user) return true;
        return false;
    }

    

    
}
