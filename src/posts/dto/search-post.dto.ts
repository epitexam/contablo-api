import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPostDto {
    @ApiPropertyOptional({ description: 'Texte contenu dans le post (recherche floue)' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({ description: "UUID exact du post" })
    @IsOptional()
    @IsUUID()
    postUuid?: string;

    @ApiPropertyOptional({ description: "UUID de l'article associé au post" })
    @IsOptional()
    @IsUUID()
    articleUuid?: string;

    @ApiPropertyOptional({ description: "Nom d'utilisateur de l'auteur (recherche floue)" })
    @IsOptional()
    @IsString()
    authorUsername?: string;

    @ApiPropertyOptional({ description: 'Nombre de résultats à retourner', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Décalage des résultats (offset)', default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}
