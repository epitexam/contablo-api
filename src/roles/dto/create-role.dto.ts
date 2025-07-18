import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'The unique name of the role (e.g., admin, user, editor)',
        example: 'admin',
    })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({
        description: 'Optional description of the role',
        example: 'Administrator role with full permissions',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
