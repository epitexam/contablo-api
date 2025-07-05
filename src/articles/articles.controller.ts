import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UnauthorizedException, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNoContentResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { SingleArticleDto } from './dto/single-article.dto';
import { audit, take } from 'rxjs';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly usersService: UsersService
  ) { }

  private async getUserOrThrow(req) {
    const userInfo = await this.usersService.findOneByUuid(req.user.uuid);
    if (!userInfo) {
      throw new UnauthorizedException('User not found or unauthorized');
    }
    return userInfo;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  async create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    const userInfo = await this.getUserOrThrow(req);
    return this.articlesService.create(createArticleDto, userInfo);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list articles' })
  searchArticles(@Query() searchDto: SearchArticleDto) {
    return this.articlesService.search(searchDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Get('my-articles')
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page of results to display',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  async myArticles(@Request() req, @Query('page') page: number, @Query('limit') limit: number) {
    const userInfo = await this.getUserOrThrow(req);
    return this.articlesService.findByAuthor(userInfo, limit, page);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single article by UUID' })
  async findOne(@Param('uuid') uuid: string) {
    const article = await this.articlesService.findOneByUuid(uuid);
    if (!article) {
      throw new NotFoundException(`Article with UUID ${uuid} not found`);
    }
    return article;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Patch(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update an article by UUID' })
  async update(@Param('uuid') uuid: string, @Body() updateArticleDto: UpdateArticleDto, @Request() req) {
    const user = await this.getUserOrThrow(req);
    return this.articlesService.performActionByAuthor(uuid, user, 'update', updateArticleDto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete an article by UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('uuid') uuid: string, @Request() req) {
    const user = await this.getUserOrThrow(req);
    return this.articlesService.performActionByAuthor(uuid, user, "delete")
  }
}