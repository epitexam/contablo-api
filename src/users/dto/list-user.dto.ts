// user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ListUserDto {

    @ApiProperty()
    uuid: string;

    @ApiProperty()
    username: string;

    @ApiProperty({ required: false })
    createdAt?: Date;

    @ApiProperty({ required: false })
    updatedAt?: Date;

    constructor(user: User) {
        this.uuid = user.uuid;
        this.username = user.username;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
