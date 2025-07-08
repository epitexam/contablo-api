import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty({
        description: 'Post content',
        example: 'This is a comment.',
    })
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({
        description: 'UUID of the related article (if the post comments on an article)',
        example: 'a82b27c9-282f-4a7b-a76d-d355a590b35c',
    })
    @IsUUID()
    articleUuid?: string;

    @ApiPropertyOptional({
        description: 'UUID of the parent post (if this post is a reply)',
        example: 'e7dbdf8e-7b3e-4bc5-a292-b19199e3b0ab',
    })
    @IsOptional()
    @IsUUID()
    parentUuid?: string;
}
