import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
    @ApiProperty({ example: 'My first article' })
    title: string;

    @ApiProperty({ example: 'This is the content of the article.' })
    content: string;

    @ApiProperty({ example: 'A short description of the article.' })
    description: string;

    @ApiProperty({ example: 'my-first-article' })
    slug: string;

    @ApiProperty({ example: false, required: false })
    published?: boolean;
}
