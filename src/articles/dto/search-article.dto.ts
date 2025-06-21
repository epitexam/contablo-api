import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchArticleDto {
    @ApiPropertyOptional({ description: "Author's username." })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({ description: 'Filter by published status.' })
    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @ApiPropertyOptional({ description: 'Filter by article slug.' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number for pagination.' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiPropertyOptional({ example: 10, description: 'Number of results per page.' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @ApiPropertyOptional({ example: `-${new Date().toISOString()}`, description: 'Sort order by date string, e.g. "-2024-06-07T12:00:00.000Z" (desc).' })
    @IsOptional()
    @IsString()
    sort?: string;
}
