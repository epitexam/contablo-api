import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
    @ApiProperty({
        description: 'Post content',
        example: 'This is a comment.',
    })
    @IsNotEmpty()
    content: string;
}
