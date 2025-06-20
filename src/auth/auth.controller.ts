import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }


    @ApiOperation({ summary: 'Create a new user' })
    @ApiCreatedResponse({ description: 'User successfully created' })
    @ApiBadRequestResponse({ description: 'Invalid user input' })
    @ApiConflictResponse({ description: 'Username/Email already in use' })
    @Post('signup')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Authenticate user and get JWT access token' })
    @ApiBody({ type: LoginDto, description: 'User credentials' })
    @ApiResponse({
        status: 201, description: 'JWT token returned successfully', schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid email or password' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        return this.authService.login(user);
    }

}
