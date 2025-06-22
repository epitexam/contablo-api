import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }


    @ApiOperation({ summary: 'Create a new user' })
    @ApiCreatedResponse({
        description: 'User successfully created',
        type: UserResponseDto,
        schema: {
            example: {
                uuid: 'b1a7c8e2-1234-4f56-9abc-1234567890ab',
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                fullName: 'John Doe',
                createdAt: '2024-06-01T12:00:00.000Z',
                updatedAt: '2024-06-01T12:00:00.000Z'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Invalid user input',
        schema: {
            example: {
                "message": [
                    "password must be longer than or equal to 6 characters",
                    "password must be a string"
                ],
                "error": "Bad Request",
                "statusCode": 400
            }
        }
    })
    @ApiConflictResponse({
        description: 'Username/Email already in use',
        schema: {
            example: {
                "message": "Email already in use",
                "error": "Conflict",
                "statusCode": 409
            }
        }
    })
    @Post('signup')
    @HttpCode(201)
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {}
    }

    @Post('login')
    @ApiOperation({ summary: 'Authenticate user and get JWT access token' })
    @ApiBody({
        type: LoginDto,
        description: 'User credentials',
        examples: {
            valid: {
                summary: 'Valid example',
                value: { email: 'john.doe@example.com', password: 'password123' }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'JWT token returned successfully',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid email or password',
        schema: {
            example: {
                "message": "Invalid credentials",
                "error": "Unauthorized",
                "statusCode": 401
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Invalid user input',
        schema: {
            example: {
                "message": [
                    "password must be longer than or equal to 6 characters",
                    "password must be a string"
                ],
                "error": "Bad Request",
                "statusCode": 400
            }
        }
    })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        return this.authService.login(user);
    }

}
