import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'Unique username',
        example: 'john_doe_updated',
        required: false,
    })
    username?: string;

    @ApiProperty({
        description: 'Unique user email address',
        example: 'john.doe_updated@example.com',
        required: false,
    })
    email?: string;

    @ApiProperty({
        description: 'User password',
        example: 'newpassword123',
        required: false,
    })
    password?: string;

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: false,
    })
    firstName?: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: false,
    })
    lastName?: string;

    @ApiProperty({
        description: 'User biography',
        example: 'Passionate full-stack developer.',
        required: false,
    })
    bio?: string;

    @ApiProperty({
        description: 'URL of the user avatar',
        example: 'https://example.com/avatar_updated.jpg',
        required: false,
    })
    avatarUrl?: string;
}
