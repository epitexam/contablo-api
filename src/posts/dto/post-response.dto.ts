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

    @ApiProperty({
        description: 'Replies to this post (child posts)',
        type: () => [PostDto],
        required: false,
    })
    @Expose()
    @Type(() => PostDto)
    children?: PostDto[];

    @ApiProperty({
        description: 'Parent posts of this post',
        type: () => [PostDto],
        required: false,
    })
    @Expose()
    @Type(() => PostDto)
    parent?: PostDto[];
}
