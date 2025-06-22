import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateArticleDto {
    @ApiProperty({
        example: 'My updated article',
        description: 'The title of the article.',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        example: 'This is the updated content of the article.',
        description: 'The full content/body of the article.',
        required: false,
    })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({
        example: 'A short updated description of the article.',
        description: 'A brief summary or description of the article.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 'my-updated-article',
        description: 'A unique slug for the article, used in URLs.',
        required: false,
    })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({
        example: true,
        description: 'Whether the article is published (true) or in draft mode (false).',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @ApiProperty({
        type: [String],
        example: ['nestjs', 'typescript', 'backend'],
        description: 'List of tags associated with the article.',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
