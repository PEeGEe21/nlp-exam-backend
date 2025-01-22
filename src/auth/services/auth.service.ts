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

    async signInAs(loginDto: any): Promise<LoginResponseDto> {
      const { email } = loginDto;
      const user = await this.usersService.getUserAccountByEmail(email);
      if (!user)
          throw new HttpException('Incorrrect Email or Password.', HttpStatus.BAD_REQUEST);

      await this.usersService.checkAccountActiveStatus(user.id);

      // if (user) return this.loginUser(user, false);
      return this.loginUser(user, false);
  }


    private async loginUser(
        user: any,
        password: any,
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

            if(password){
        
              const isCorrectPassword = await bcrypt.compare(password, userPassword);

              if (!isCorrectPassword) {
                return {
                    error: 'Error',
                    message: 'Incorrect Password'
                }
                  // throw new BadRequestException(
                  //     'SignIn Failed!, Incorrect login credentials',
                  // );
              }
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
          // console.log(error)
            throw new Error('Error Occured while signing');
        }
        
    }

    async signUp(
        userdetails: CreateUserDto,
      ): Promise<SignUpResponseDto> {
        try{
    
        if(!userdetails.email || !userdetails.password){
            throw new BadRequestException(
              `password and email fields are required`,
            );
        }
        userdetails.email = userdetails.email.toLowerCase();
        
        await this.checkUserAccountEmailExists(userdetails.email);

        if(userdetails.username){
          await this.checkUserAccountUsernameExists(userdetails.username);
        }

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
          profile_created: 1,
          lastname: userdetails?.lname??'',
          firstname: userdetails?.fname??'',
          state: userdetails?.state??'',
          phonenumber: userdetails?.phonenumber??'',
        };
    
        const userProfileDetails = await this.createUserProfile(user.id, userprofilepayload)

        // if()
        const student = await this.createUserStudent(user);
        console.log(student, 'student')
    
        await this.updateUserProfile(user.id,userProfileDetails)
        const payload = {
          email: user.email,
          sub: user.id,
        };
        user.profile = userProfileDetails
        const profile = userProfileDetails
    
        // console.log(profile, student, 'profile details')
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
      } catch(err){

      }
    }

    async signUpAsAdmin(
        userdetails: CreateUserDto,
      ): Promise<SignUpResponseDto> {
    
        try{
        if(!userdetails.email || !userdetails.password){
            throw new BadRequestException(
              `password and email fields are required`,
            );
        }
    
        // console.log('herer')
        userdetails.email = userdetails.email.toLowerCase();
    
        await this.checkUserAccountEmailExists(userdetails.email);

        if(userdetails.username){
          await this.checkUserAccountUsernameExists(userdetails.username);
        }

        if (userdetails.password) {
          const saltOrRounds = 10;
          userdetails.password = await bcrypt.hash(
            userdetails.password,
            saltOrRounds,
          );
        }

        if(userdetails.user_role == 'admin' || !userdetails.user_role){
          userdetails.user_role = 'admin';
          await this.checkUserAccountStaffIdExists(userdetails.staffId);
        }

        const user: any = await this.createUser(userdetails);
    
        const userprofilepayload = {
          user: user,
          email: user.email,
          profile_created: 1,
          lastname: userdetails?.lname??'',
          firstname: userdetails?.fname??'',
          phonenumber: userdetails?.phonenumber??'',
          staffId: userdetails?.staffId??'',
        };
    
        const userProfileDetails = await this.createUserProfile(user.id, userprofilepayload)
    
        await this.updateUserProfile(user.id,userProfileDetails)
        const payload = {
          email: user.email,
          sub: user.id,
        };
        user.profile = userProfileDetails
        const profile = userProfileDetails
    
        delete user.password;
    
        return {
          success: "success",
          access_token: this.jwtService.sign(payload),
          user,
          // profile:profile,
          message: 'Account was successfully created',
        };
      } catch(err){

      }
    }
    
    async createUser(userDetails: CreateUserDto) {
        const newUser = this.userRepository.create({
          ...userDetails,
          created_at: new Date(),
        });
        return this.userRepository.save(newUser);
    }

    async hashPassword(password){
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(
        password,
        saltOrRounds,
      );
      return hashedPassword;
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

        console.log(newStudent, 'aievoivowmvomeovm')

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

    async checkUserAccountStaffIdExists(staffId: string): Promise<void> {
        const userAccountExists: boolean =
          await this.usersService.checkUserAccountStaffIdExists(staffId);
        if (userAccountExists) {
          throw new ConflictException(
            'An account with this staff id exists',
          );
        }
    }

    async checkUserAccountMatricIdExists(matricId: string): Promise<void> {
        const userAccountExists: boolean =
          await this.usersService.checkUserAccountMatricIdExists(matricId);
        if (userAccountExists) {
          throw new ConflictException(
            'An account with this matric id exists',
          );
        }
    }

    async checkUserAccountUsernameExists(username: string): Promise<void> {
        const userAccountExists: boolean =
          await this.usersService.checkUserAccountUsernameExists(username);
        if (userAccountExists) {
          throw new ConflictException(
            'An account with this username exists, use a different username',
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
