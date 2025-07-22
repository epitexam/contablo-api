import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/users/users.decoraters';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  async create(@Body() createArticleDto: CreateArticleDto, @CurrentUser() currentUser) {
    return this.articlesService.create(createArticleDto, currentUser.uuid)
  }

  @Get()
  @ApiOperation({ summary: 'Search and list articles' })
  searchArticles(@Query() searchDto: SearchArticleDto) {
    return this.articlesService.search(searchDto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Get('my-articles')
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page of results to display',
    example: 1,
    default:1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
    default:10,
    type: Number,
  })
  async myArticles(@CurrentUser() currentUser, @Query('page') page: number, @Query('limit') limit: number) {
    return this.articlesService.findArticleByAuthor(currentUser.uuid, +page, +limit)
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single article by UUID' })
  async findOne(@Param('uuid') uuid: string) {
    return this.articlesService.findOneByuuid(uuid)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Patch(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update an article by UUID' })
  async update(@Param('uuid') uuid: string, @Body() updateArticleDto: UpdateArticleDto, @CurrentUser() currentUser) {
    return this.articlesService.updateArticle(uuid, currentUser.uuid, currentUser.roles, updateArticleDto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete an article by UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('uuid') uuid: string, @CurrentUser() currentUser) {
    return this.articlesService.deleteArticle(uuid, currentUser.uuid, currentUser.roles)
  }
}