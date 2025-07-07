import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPostDto {
    @ApiPropertyOptional({ description: 'Text contained in the post (fuzzy search)' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({ description: 'Exact UUID of the post' })
    @IsOptional()
    @IsUUID()
    postUuid?: string;

    @ApiPropertyOptional({ description: 'UUID of the article associated with the post' })
    @IsOptional()
    @IsUUID()
    articleUuid?: string;

    @ApiPropertyOptional({ description: "Author's username (fuzzy search)" })
    @IsOptional()
    @IsString()
    authorUsername?: string;

    @ApiPropertyOptional({ description: "Responses of the post", default: false })
    @IsOptional()
    response: boolean;

    @ApiPropertyOptional({ description: 'Number of results to return', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Results page', default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    page?: number = 0;
}
