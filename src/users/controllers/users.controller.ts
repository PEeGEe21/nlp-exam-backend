import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}
    @Get('dashboard/:user_id')
    getDashboardData(@Param('user_id', ParseIntPipe) user_id: number) {
        return this.usersService.getUserDashboardData(user_id);
    }
}
