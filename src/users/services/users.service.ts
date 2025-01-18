import { forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { UpdateUserDto } from 'src/auth/dtos/update-user.dto';
import { Profile } from 'src/typeorm/entities/Profile';
import { Question } from 'src/typeorm/entities/Question';
import { Result } from 'src/typeorm/entities/Result';
import { Student } from 'src/typeorm/entities/Student';
import { Test } from 'src/typeorm/entities/Test';
import { User } from 'src/typeorm/entities/User';
import { AuthService } from 'src/auth/services/auth.service';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';


// export type User = any;
const UserRoles = {
    student: 'STUDENT',
    admin: 'ADMIN',
    super_admin: 'SUPER ADMIN',
}
@Injectable()
export class UsersService {
    constructor(


        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,

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



    async findAll() {
        const users = await this.userRepository.find({relations: ['profile']});
    

        const updatedUsers = users.map((user) => {
            // const rolesIds = roles.map((role) => role.roleId); // Pluck role IDs
            // const defaultUserRole = roles.find((role) => role.is_default); 
            // const defaultRole = defaultUserRole ? defaultUserRole.role : null;
            // const user_default_role = defaultRole ? defaultRole.name : null;
            const user_role_name = UserRoles[user.user_role];
            // const user_default_role_id = defaultRole ? Number(defaultRole.id) : null;
            delete user.password
            return {     
                ...user,
                user_role_name
                // roles: roles,
                // default_role: defaultRole,
                // user_default_role,
                // user_default_role_id,
                // rolesIds
            };
        });

        const res = {
            success: 'success',
            message: 'successfull',
            users: updatedUsers,
        };
  
        return res;
    }

    async updateUserStatus(user_id: number){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            let is_active =!user.is_active;
            await this.userRepository.update({ id: user.id }, {is_active: is_active});

            const data = {
                success: 'success',
                message: 'User status updated successfully',
            }
            return data;


        } catch(err){

        }
    }

    async getAdminUserDashboardData(user_id: number): Promise<any | undefined> {
        const user = await this.userRepository.findOne({where: { id: user_id }});
        if(!user){
            return{
                error: 'error',
                message: 'No User Found'
            }
        }

        const users = await this.userRepository.find({});
        const user_questions = await this.questionsRepository.find({where:{userId : user_id}});
        const total_questions = await this.questionsRepository.find({});
        const tests = await this.testsRepository.find({});
        const activeTests = await this.getActiveTests();
        const students = await this.studentRepository.find({});
        const results = await this.resultsRepository.find({
            order: {
                createdAt: 'DESC', // Sort by creation date in descending order
            },
            take: 20, // Limit the number of results to 8
            relations: ['user', 'test', 'student', 'student.user'],
        });
    
        const total_users = users.length;
        const questions = total_questions.length;
        const all_questions = user_questions.length;
        const total_tests = tests.length;
        const total_students = students.length;
        const total_active_tests = activeTests.length;
        const res = {
            success: 'success',
            message: 'successful',
            total_questions:questions,
            user_questions:all_questions,
            total_tests,
            total_students,
            total_users,
            active_tests : total_active_tests,
            results
        };

        return res;
    }

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
            relations: ['user', 'test', 'student', 'student.user'],
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

    async createUser(userdetails: CreateUserDto){
        let savedData
        if(userdetails.user_role == UserRoles['student']){
             savedData = await this.authService.signUp(userdetails);
        } else{
            savedData = await this.authService.signUpAsAdmin(userdetails);
        }

        if(savedData.success == 'success'){
            const data = {
                success: 'success',
                message: 'User created successfully',
            }
            return data
        }

        throw new HttpException(
            'An Error Occurred!',
            HttpStatus.BAD_REQUEST
        );
    }

    async updateUser(user_id: number, userdetails: UpdateUserDto){
        const user  = await this.getUserAccountById(user_id);
        if(!user)
            return{
                error: 'error',
                message: 'User not found'
            }

        const matches = await this.checkUserEmailMatchesIncoming(user, userdetails)
        if(!matches)
            await this.authService.checkUserAccountEmailExists(userdetails.email);
        
        const updatedFields: {
            username?: string;
            // firstname: string;
            // lastname: string;
            email: string;
            password?: string; 
            user_role?: any; 
            profile?: any; 
        } = {
            username: userdetails.username,
            // firstname: userdetails.fname,
            // lastname: userdetails.lname,
            email: userdetails.email,
            user_role: userdetails.user_role,
        };

        const profile = await this.updateUserProfile(user, userdetails);
        
        if(profile && !user.profile)
            updatedFields.profile = profile;

        if(userdetails.password || userdetails.password !== '')
            updatedFields.password = await this.authService.hashPassword(userdetails.password);


        const update = await this.userRepository.update({ id: user.id }, updatedFields);
    
        console.log(update)
        if(update.affected < 1){
            return {
                error:'error',
                message: 'An error has occurred'
            }
        }
    
        const data = {
            success: 'success',
            message: 'User updated successfully',
        }
        return data
    };

    async updateUserProfile(user:any, userdetails:any){
        try{
            const profile = await this.profileRepository.findOne({ where: { user: user } });
            if (!profile) {
                const profile = await this.profileRepository.findOne({ where: { email: user.email } });
            }
            console.log(profile, 'profile')

            if (!profile) {
                const userprofilepayload = {
                    user: user,
                    email: user.email,
                    profile_created: 1,
                    lastname: userdetails.lname??'',
                    firstname: userdetails.fname??'',
                };
                console.log(userprofilepayload, 'userprofilepayload')
                const savedProfile = await this.authService.createUserProfile(user.id, userprofilepayload)
                if(!savedProfile){
                    throw new HttpException(
                        'Error creating Profile',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }
                return profile
            }

            const updatedFields: {
                firstname?: string;
                lastname?: string;
                email?: string;
            } = {
            };

            if(userdetails.lname)
                updatedFields.lastname = userdetails.lname??'';

            if(userdetails.fname)
                updatedFields.firstname = userdetails.fname??'';

            if(userdetails.email)
                updatedFields.email = userdetails.email??'';

            const update = await this.profileRepository.update({ user: user }, updatedFields);
            // const update = await this.profileRepository.update({ id: profile.id }, updatedFields);
            if(update.affected < 1){
                return false
            }
            return profile

        } catch (err) {
            console.log(err)
        }

    }

    async getUserResults(user_id: number): Promise<any | undefined> {
        const user = await this.userRepository.findOne({where: { id: user_id }});
        if(!user){
            return{
                error: 'error',
                message: 'No User Found'
            }
        }

        const results = await this.resultsRepository.find({
            where:{user : user},
            order: {
                createdAt: 'DESC', // Sort by creation date in descending order
            },
            take: 8, // Limit the number of results to 8
            relations: ['user', 'test', 'student', 'student.user'],
        });

        const res = {
            success: 'success',
            message: 'successful',
            results
        };

        return res;
    }

    async delete(id: number) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
            });
        
            if (!user) {
                return { error: 'error', message: 'User not found' };
            }
    
            await this.deleteUserProfile(user);

            if(user.user_role == 'student'){
                await this.deleteUserStudentProfile(user);
            }
                
            await this.userRepository.softDelete(id);

            return { success: 'success', message: 'User deleted successfully' };
    
        } catch (err) {
                console.error('Error deleting user:', err);
                throw new HttpException(
                    'Error deleting User',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }

    async deleteUserProfile(user){
        const user_profile = await this.findUserProfile(user);

        if(user_profile)
            await this.profileRepository.softDelete(user_profile.id);
    }

    async deleteUserStudentProfile(user){
        const student = await this.findUserProfile(user);

        if(student)
            await this.studentRepository.softDelete(student.id);
    }

    async findStudentProfile(user){
        const student = await this.studentRepository.findOne({
            where: { user: user },
        });
        if(!student)
            return null;

        return student
    }

    async findUserProfile(user){
        const user_profile = await this.profileRepository.findOne({
            where: { user: user },
        });
        if(!user_profile)
            return null;

        return user_profile
    }

    async checkAccountActiveStatus(id: number): Promise<any> {
        const isDeactivated = await this.userRepository.findOne({ where: {id: id, is_active: false} });
        if (isDeactivated) {
            throw new UnauthorizedException(
                'Your account has been deactivated. Contact the Admin.',
            );
        }
    }

    async checkUserEmailMatchesIncoming(user, userDetails) {
        const currentEmail = user.email.trim().toLowerCase();
        const newEmail = userDetails.email.trim().toLowerCase();

        const matches = currentEmail === newEmail;

        return matches;
    }

    async checkPasswordMatchesIncoming(apassword, cpassword) {
        const password = apassword.trim();
        const confirmpassword = cpassword.trim();

        const matches = password === confirmpassword;

        return matches;
    }

    async getUserAccountByEmail(email: string) {
        // const user = this.users.find(user => user.email === email);
        const user = await this.userRepository.findOneBy({ email });    
        return user;
    }
    async getUserAccountByUsername(username: string) {
        const user = await this.userRepository.findOneBy({ username });    
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
    async checkUserAccountUsernameExists(username: string): Promise<boolean> {
        const user = await this.getUserAccountByUsername(username);
        if (user) return true;
        return false;
    }

    

    
}
