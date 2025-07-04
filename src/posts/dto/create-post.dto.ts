import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty({
        description: 'Contenu du post',
        example: 'Ceci est un commentaire.',
    })
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({
        description: 'UUID de l’article lié (si le post commente un article)',
        example: 'a82b27c9-282f-4a7b-a76d-d355a590b35c',
    })
    @IsOptional()
    @IsUUID()
    articleUuid?: string;

    @ApiPropertyOptional({
        description: 'UUID du post parent (si ce post est une réponse)',
        example: 'e7dbdf8e-7b3e-4bc5-a292-b19199e3b0ab',
    })
    @IsOptional()
    @IsUUID()
    parentUuid?: string;
}
