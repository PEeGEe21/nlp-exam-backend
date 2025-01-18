import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('/')
    findAll() {
        return this.usersService.findAll();
    }

    @Delete('delete/:id')
    remove(@Param('id') id: number) {
        return this.usersService.delete(+id);
    }

    @Post('/add-user')
    async createUser(
        @Body() userSignupDto: any,
    ): Promise<any> {
        return this.usersService.createUser(userSignupDto);
    }

    @Post('/update-user/:user_id')
    async updateUser(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Body() userUpdateDto: any,
    ): Promise<any> {
        return this.usersService.updateUser(user_id, userUpdateDto);
    }

    @Get('admin-dashboard/:user_id')
    getAdminUserDashboardData(@Param('user_id', ParseIntPipe) user_id: number) {
        return this.usersService.getAdminUserDashboardData(user_id);
    }

    @Get('dashboard/:user_id')
    getDashboardData(@Param('user_id', ParseIntPipe) user_id: number) {
        return this.usersService.getUserDashboardData(user_id);
    }

    @Get('/:user_id/results')
    getUserResults(@Param('user_id', ParseIntPipe) user_id: number) {
        return this.usersService.getUserResults(user_id);
    }

    @Post('/update-active-status/:user_id')
    async updateUserStatus(
        @Param('user_id', ParseIntPipe) user_id: number,
    ): Promise<any> {
        return this.usersService.updateUserStatus(user_id);
    }
}
