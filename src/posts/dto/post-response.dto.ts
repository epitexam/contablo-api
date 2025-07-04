import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
    @ApiProperty({ description: "Nom d'utilisateur de l'auteur" })
    @Expose()
    username: string;
}

export class PostDto {
    @ApiProperty({ description: 'UUID du post' })
    @Expose()
    uuid: string;

    @ApiProperty({ description: 'Contenu textuel du post' })
    @Expose()
    content: string;

    @ApiProperty({ description: 'Date de création du post', type: String, format: 'date-time' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: "Auteur du post", type: AuthorDto })
    @Expose()
    @Type(() => AuthorDto)
    author: AuthorDto;

    @ApiProperty({
        description: 'Réponses à ce post (posts enfants)',
        type: () => [PostDto],
        required: false,
    })
    @Expose()
    @Type(() => PostDto)
    children?: PostDto[];
}
