import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/typeorm/entities/Profile';
import { Question } from 'src/typeorm/entities/Question';
import { Result } from 'src/typeorm/entities/Result';
import { Student } from 'src/typeorm/entities/Student';
import { Test } from 'src/typeorm/entities/Test';
import { User } from 'src/typeorm/entities/User';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';


// export type User = any;

@Injectable()
export class UsersService {
    constructor(

        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>,  
        @InjectRepository(Question) private questionsRepository: Repository<Question>,
        @InjectRepository(Test) private testsRepository: Repository<Test>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Result) private resultsRepository: Repository<Result>,

    ) {}
      
    // async findOne(username: string): Promise<User | undefined> {
    //     return this.users.find(user => user.username === username);
    // }

    async getUserDashboardData(user_id: number): Promise<any | undefined> {
        const user = await this.userRepository.findOne({where: { id: user_id }});
        if(!user){
            return{
                error: 'error',
                message: 'No User Found'
            }
        }

        const all_questions = await this.questionsRepository.find({where:{userId : user_id}});
        const tests = await this.testsRepository.find({});
        const activeTests = await this.getActiveTests();
        const students = await this.studentRepository.find({});
        const results = await this.resultsRepository.find({
            order: {
                createdAt: 'DESC', // Sort by creation date in descending order
            },
            take: 8, // Limit the number of results to 8
        });
    
        const total_questions = all_questions.length;
        const total_tests = tests.length;
        const total_students = students.length;
        const total_active_tests = activeTests.length;
        const res = {
            success: 'success',
            message: 'successful',
            total_questions,
            total_tests,
            total_students,
            active_tests : total_active_tests,
            results
        };

        return res;
    }

    async getActiveTests() {
        const currentDate = new Date();

        const tests = await this.testsRepository.find({
            where: {
                startDate: LessThanOrEqual(currentDate),
                endDate: MoreThanOrEqual(currentDate),
            },
            order: {
                startDate: 'ASC', // Optional: Sort by start date if needed
            },
        });
        
        return tests;
    }

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
