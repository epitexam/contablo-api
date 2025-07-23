import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    
    @ApiProperty({
        description: 'Unique username',
        example: 'john_doe',
        required: true
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'Unique user email address',
        example: 'john.doe@example.com',
        required: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'password123',
        required: true
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: true
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: true
    })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({
        description: 'User biography',
        example: 'Passionate full-stack developer.',
        required: false,
    })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiProperty({
        description: 'URL of the user avatar',
        example: 'https://example.com/avatar.jpg',
        required: false,
    })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({
        description: 'Make user private',
        example: false,
        required: true,
    })
    @IsBoolean()
    private: boolean;
}
