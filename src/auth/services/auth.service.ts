import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailLoginDto } from '../dtos/email-login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dtos/create-user.dto';
import { SignUpResponseDto } from '../dtos/signup-response.dto';
import { CreateUserProfileDto } from '../dtos/create-user-profile.dto';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';
import { Profile } from 'src/typeorm/entities/Profile';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/typeorm/entities/Student';
import { CreateStudentDto } from '../dtos/create-user-student.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,

        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private userProfileRepository: Repository<Profile>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
    ) {}

    async signIn(loginDto: EmailLoginDto): Promise<LoginResponseDto> {
        const { email, password } = loginDto;
        const user = await this.usersService.getUserAccountByEmail(email);
        if (!user)
            throw new HttpException('User not found.', HttpStatus.BAD_REQUEST);

        if (user) return this.loginUser(user, password);
        return this.loginUser(user, password);
    }

    private async loginUser(
        user: any,
        password: string,
      ): Promise<LoginResponseDto> {
        
        try {
            if (!user) {
                throw new UnauthorizedException(
                    'SignIn Failed!, Incorrect login credentials',
                );
            }
            
            const userPassword = await this.usersService.getUserAccountPassword(
                user.email,
            );
        
            const isCorrectPassword = await bcrypt.compare(password, userPassword);

            if (!isCorrectPassword) {
                throw new BadRequestException(
                    'SignIn Failed!, Incorrect login credentials',
                );
            }
            
            const payload = {
                email: user.email,
                sub: user.id,
            };
        
            delete user.password;
        
            const response = {
                access_token: await this.jwtService.signAsync(payload),
                success: 'success',
                message: 'Logged in successfully',
                user: { ...user },
            };

            return response;

        } catch (error) {
            throw new Error('Error Occured while signing');
        }
        
    }

    async signUp(
        userdetails: CreateUserDto,
      ): Promise<SignUpResponseDto> {
    
        if(!userdetails.email || !userdetails.password){
            throw new BadRequestException(
              `password and email fields are required`,
            );
        }
    
        // console.log('herer')
    
        await this.checkUserAccountEmailExists(userdetails.email);
    
        if (userdetails.password) {
          const saltOrRounds = 10;
          userdetails.password = await bcrypt.hash(
            userdetails.password,
            saltOrRounds,
          );
        }
        const user: any = await this.createUser(userdetails);
    
        const userprofilepayload = {
          user: user,
          email: user.email,
          profile_created: 1
        };
    
        const userProfileDetails = await this.createUserProfile(user.id, userprofilepayload)

        const student = await this.createUserStudent(user);
    
        await this.updateUserProfile(user.id,userProfileDetails)
        const payload = {
          email: user.email,
          sub: user.id,
        };
        user.profile = userProfileDetails
        const profile = userProfileDetails
    
        console.log(profile, student, 'profile details')
        // if (config.env === 'production') {
        //   const data = {
        //     env: 'Production',
        //     name: `${userdetails.firstName} ${userdetails.lastName}`,
        //     email: userdetails.email,
        //   };
        //   await this.messagingService.userSignUpNotification(data);
        // }
        delete user.password;
    
        return {
          success: "success",
          access_token: this.jwtService.sign(payload),
          user,
          // profile:profile,
          message: 'Account was successfully created',
        };
    }
    
    async createUser(userDetails: CreateUserDto) {
        const newUser = this.userRepository.create({
          ...userDetails,
          created_at: new Date(),
        });
        return this.userRepository.save(newUser);
    }

    async updateUserProfile(id: number, profile: Profile) {
      const user = await this.usersService.getUserAccountById(id);
      user.profile = profile;

      return this.userRepository.save(user);
  }
    
    async createUserProfile(user_id: number, userProfileDetails: CreateUserProfileDto) {
        const newUserProfile = this.userProfileRepository.create({
          ...userProfileDetails,
        });
        return this.userProfileRepository.save(newUserProfile);
    }

    async createUserStudent(user) {
        const newStudent = this.studentRepository.create({
          user,
        });

        return this.studentRepository.save(newStudent);
    }

    async checkUserAccountEmailExists(email: string): Promise<void> {
        const userAccountExists: boolean =
          await this.usersService.checkUserAccountEmailExists(email);
        if (userAccountExists) {
          throw new ConflictException(
            'An account with this email exists, use a different email',
          );
        }
    }
  
    // async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    //   const user = await this.usersService.findOne(username);
    //   if (user?.password !== pass) {
    //     throw new UnauthorizedException();
    //   }
    //   const payload = { sub: user.userId, username: user.username };
    //   return {
    //     access_token: await this.jwtService.signAsync(payload),
    //   };
    // }

  }
