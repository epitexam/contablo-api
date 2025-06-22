import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export class CreateArticleDto {
    @ApiProperty({
        example: 'My first article',
        description: 'The title of the article.',
    })
    @IsString()
    title: string;

    @ApiProperty({
        example: uuidv4(),
        description: 'Unique identifier for the article.',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    uuid?: string;

    @ApiProperty({
        example: 'This is the content of the article.',
        description: 'The full content/body of the article.',
    })
    @IsString()
    content: string;

    @ApiProperty({
        example: 'A short description of the article.',
        description: 'A brief summary or description of the article.',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 'my-first-article',
        description: 'A unique slug for the article, used in URLs.',
    })
    @IsOptional()
    @IsString()
    slug: string;

    @ApiProperty({
        example: true,
        description:
            'Whether the article is published (true) or in draft mode (false).',
    })
    @IsBoolean()
    published: boolean;

    @ApiProperty({
        type: [String],
        example: ['nestjs', 'typescript', 'backend'],
        description: 'List of tags associated with the article.',
    })
    @IsArray()
    @IsString({ each: true })
    tags: string[];
}
