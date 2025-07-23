import { ApiProperty } from '@nestjs/swagger';
import { ArticleListItemDto } from '../../articles/dto/list-article.dto';
import { ProfilePublicDto } from './profile.public.user.dto';
import { User } from '../entities/user.entity';

export class ProfilePrivateDto extends ProfilePublicDto {
    @ApiProperty({ required: false, description: "User's first name" })
    firstName?: string;

    @ApiProperty({ required: false, description: "User's last name" })
    lastName?: string;

    @ApiProperty({ required: false, description: "User email" })
    email?: string;

    @ApiProperty({ description: "Date of last user update" })
    updatedAt: Date;

    @ApiProperty({ description: 'State of user profile' })
    private: boolean;

    @ApiProperty({
        type: () => [ArticleListItemDto],
        required: false,
        description: "List of articles posted by the user"
    })
    articles?: ArticleListItemDto[];

    constructor(user: User, articles?: ArticleListItemDto[]) {
        super(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.bio = user.bio;
        this.email = user.email;
        this.updatedAt = user.updatedAt;
        this.private = user.private;
        this.articles = articles;
    }
}