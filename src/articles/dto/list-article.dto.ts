import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ArticleListItemDto {
    @ApiProperty({ example: 'b1a7c8e2-1234-4f56-9abc-1234567890ab' })
    @IsUUID()
    uuid: string;

    @ApiProperty({ example: 'My first article' })
    title: string;

    @ApiProperty({ example: 'my-first-article' })
    slug: string;

    @ApiProperty({ example: true })
    published: boolean;

    @ApiProperty({ example: '2024-06-01T12:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: 'johndoe' })
    authorUsername: string;

    @ApiProperty({ example: ['nestjs', 'typescript', 'backend'], description: 'List of tags associated with the article.' })
    tags: string[];
}

export class ListArticleDto {
    @ApiProperty({ type: [ArticleListItemDto] })
    items: ArticleListItemDto[];

    @ApiProperty({ example: 42 })
    total: number;
}
