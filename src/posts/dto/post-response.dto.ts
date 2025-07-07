import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
    @ApiProperty({ description: "Author's username" })
    @Expose()
    username: string;

    @ApiProperty({ description: "Author's UUID" })
    @Expose()
    uuid: string;
}

export class ArticleDto {

    @ApiProperty({ description: "Article's UUID" })
    @Expose()
    uuid: string;
}

export class PostDto {
    @ApiProperty({ description: 'Post UUID' })
    @Expose()
    uuid: string;

    @ApiProperty({ description: 'Text content of the post' })
    @Expose()
    content: string;

    @ApiProperty({ description: 'Post creation date', type: String, format: 'date-time' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: "Post author", type: AuthorDto })
    @Expose()
    @Type(() => AuthorDto)
    author: AuthorDto;

    @ApiProperty({ description: "Article infos", type: ArticleDto })
    @Expose()
    @Type(() => ArticleDto)
    article: ArticleDto;

    @ApiProperty({
        description: 'Replies to this post (child posts)',
        type: () => [PostDto],
        required: false,
    })
    @Expose()
    @Type(() => PostDto)
    replies?: PostDto[];

    @ApiProperty({
        description: 'Parent to this post (child parent)',
        type: () => [PostDto],
        required: false,
    })
    @Expose()
    @Type(() => PostDto)
    replyTo?: PostDto[];
}
