import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ListUserDto {
    
    @ApiProperty({
        example: '5f93ac0e-bf0c-4f1c-b70e-24de69b23400',
        description: 'Unique identifier of the user.',
    })
    uuid: string;

    @ApiProperty({
        example: 'john_doe',
        description: 'Unique username of the user.',
    })
    username: string;

    @ApiProperty({
        example: '2024-06-01T12:34:56.000Z',
        description: 'Date when the user account was created.',
        required: false,
    })
    createdAt?: Date;

    @ApiProperty({
        example: '2024-07-01T08:20:10.000Z',
        description: 'Date when the user was last updated.',
        required: false,
    })
    updatedAt?: Date;

    constructor(user: User) {
        this.uuid = user.uuid;
        this.username = user.username;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
