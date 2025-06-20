// search-user.dto.ts
import { IsOptional, IsString, IsInt, Min, IsUUID, Max } from 'class-validator';

export class SearchUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsUUID()
    uuid?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(500)
    pageSize: number = 10;
}
