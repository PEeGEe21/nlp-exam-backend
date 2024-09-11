import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { EmailLoginDto } from '../dtos/email-login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { SignUpResponseDto } from '../dtos/signup-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: EmailLoginDto): Promise<LoginResponseDto> {
        return this.authService.signIn(signInDto);
    }

    @Post('/signup')
    async userSignup(
        @Body() userSignupDto: any,
    ): Promise<SignUpResponseDto> {
        return this.authService.signUp(userSignupDto);
    }
}
