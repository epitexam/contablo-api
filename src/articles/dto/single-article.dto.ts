import { ApiProperty } from '@nestjs/swagger';

export class SingleArticleDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  published: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  authorUsername: string;
}
