import { ApiProperty } from '@nestjs/swagger';
import { ArticleListItemDto } from '../../articles/dto/list-article.dto';

export class ProfileUserDto {
    @ApiProperty({ description: "User unique identifier (UUID)" })
    uuid: string;

    @ApiProperty({ description: "User's username" })
    username: string;

    @ApiProperty({ description: "User's email address" })
    email: string;

    @ApiProperty({ required: false, description: "User's first name" })
    firstName?: string;

    @ApiProperty({ required: false, description: "User's last name" })
    lastName?: string;

    @ApiProperty({ required: false, description: "User biography" })
    bio?: string;

    @ApiProperty({ required: false, description: "URL of the user's avatar" })
    avatarUrl?: string;

    @ApiProperty({ description: "Date of user creation" })
    createdAt: Date;

    @ApiProperty({ description: "Date of last user update" })
    updatedAt: Date;

    @ApiProperty({
        type: () => [ArticleListItemDto],
        required: false,
        description: "List of articles posted by the user"
    })
    articles?: ArticleListItemDto[];
}
