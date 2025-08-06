import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

    @ApiPropertyOptional({ description: "Author's uuid" })
    @IsOptional()
    @IsString()
    authorUuid?: string;

    @ApiPropertyOptional({ description: "Responses of the post", default: false })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return false;
    })
    @IsBoolean()
    onlyReplies: boolean;
    
    @ApiPropertyOptional({ description: 'Number of results to return', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Results page', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

}
