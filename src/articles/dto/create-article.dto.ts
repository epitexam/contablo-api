import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels()
export class CreateArticleDto {
    @ApiProperty({
        example: 'My first article',
        description: 'The title of the article.'
    })
    title: string;

    @ApiProperty({
        example: 'This is the content of the article.',
        description: 'The full content/body of the article.'
    })
    content: string;

    @ApiProperty({
        example: 'A short description of the article.',
        description: 'A brief summary or description of the article.'
    })
    description: string;

    @ApiProperty({
        example: 'my-first-article',
        description: 'A unique slug for the article, used in URLs.'
    })
    slug: string;

    @ApiProperty({
        example: false,
        required: false,
        description: 'Whether the article is published (true) or in draft mode (false).'
    })
    published?: boolean;
}
