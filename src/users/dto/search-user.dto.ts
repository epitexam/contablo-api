import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Min, IsUUID, Max, IsNumber } from 'class-validator';

export class SearchUserDto {
    
    @ApiPropertyOptional({
        description: "Filter by user's first name (partial match supported at controller/service level).",
        example: 'John',
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({
        description: "Filter by user's last name.",
        example: 'Doe',
    })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({
        description: "Filter by username (exact or fuzzy depending on implementation).",
        example: 'johndoe',
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({
        description: "Filter by the user's UUID (takes precedence over other filters if provided).",
    })
    @IsOptional()
    @IsUUID()
    uuid?: string;

    @ApiPropertyOptional({
        description: 'Page number for pagination (1-based).',
        example: 1,
        default: 1,
        minimum: 1,
    })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Number of results per page.',
        example: 10,
        default: 10,
        minimum: 1,
        maximum: 500,
    })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(500)
    limit?: number;
}
