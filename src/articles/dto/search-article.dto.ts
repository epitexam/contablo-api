import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchArticleDto {

    @ApiPropertyOptional({ description: "Author's username." })
    username?: string;

    @ApiPropertyOptional({ description: 'Filter by published status.' })
    published?: boolean;

    @ApiPropertyOptional({ description: 'Filter by article slug.' })
    slug?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number for pagination.' })
    page?: number;

    @ApiPropertyOptional({ example: 10, description: 'Number of results per page.' })
    limit?: number;

    @ApiPropertyOptional({ example: '-createdAt', description: 'Sort order, e.g. "createdAt" or "-createdAt".' })
    sort?: string;
}
