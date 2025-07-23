import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ProfilePublicDto {
    @ApiProperty({ description: "User unique identifier (UUID)" })
    uuid: string;

    @ApiProperty({ description: "User's username" })
    username: string;

    @ApiProperty({ required: false, description: "URL of the user's avatar" })
    avatarUrl?: string;

    @ApiProperty({ required: false, description: "User biography" })
    bio?: string;

    @ApiProperty({ description: "Date of user creation" })
    createdAt: Date;

    constructor(user: User) {
        this.uuid = user.uuid;
        this.username = user.username;
        this.avatarUrl = user.avatarUrl;
        this.bio = user.bio;
        this.createdAt = user.createdAt;
    }
}