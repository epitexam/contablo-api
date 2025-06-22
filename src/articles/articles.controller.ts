import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UnauthorizedException, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { SingleArticleDto } from './dto/single-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly usersService: UsersService
  ) { }

  private async getUserOrThrow(req): Promise<any> {
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
  @ApiCreatedResponse({ description: 'Article successfully created', type: SingleArticleDto })
  @ApiUnauthorizedResponse({ description: 'User not found or unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid article data' })
  async create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    const userInfo = await this.getUserOrThrow(req);
    return this.articlesService.create(createArticleDto, userInfo);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list articles' })
  @ApiResponse({ status: 200, description: 'List of articles returned', type: [SingleArticleDto] })
  searchArticles(@Query() searchDto: SearchArticleDto) {
    return this.articlesService.search(searchDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Get('my-articles')
  @ApiOperation({ summary: 'Get articles of the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user articles', type: [SingleArticleDto] })
  @ApiUnauthorizedResponse({ description: 'User not found or unauthorized' })
  async myArticles(@Request() req) {
    const userInfo = await this.getUserOrThrow(req);
    return this.articlesService.findByAuthor(userInfo);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single article by UUID' })
  @ApiResponse({ status: 200, description: 'Article found', type: SingleArticleDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
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
  @ApiNoContentResponse({ description: 'Article updated' })
  @ApiUnauthorizedResponse({ description: 'User not found or unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(@Param('uuid') uuid: string, @Body() updateArticleDto: UpdateArticleDto, @Request() req) {
    const article = await this.articlesService.findOneByUuid(uuid);
    if (!article) {
      throw new NotFoundException(`Article with UUID ${uuid} not found`);
    }
    await this.articlesService.findArticleByUuidAndAuthor(uuid, req.user.uuid);
    await this.articlesService.update(uuid, updateArticleDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete an article by UUID' })
  @ApiNoContentResponse({ description: 'Article deleted' })
  @ApiUnauthorizedResponse({ description: 'User not found or unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('uuid') uuid: string, @Request() req) {
    const article = await this.articlesService.findOneByUuid(uuid);
    if (!article) {
      throw new NotFoundException(`Article with UUID ${uuid} not found`);
    }
    await this.articlesService.findArticleByUuidAndAuthor(uuid, req.user.uuid);
    await this.articlesService.remove(article.uuid);
  }
}