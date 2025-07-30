import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus, HttpCode, Query, Patch } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/users/users.decoraters';
import { SearchPostDto } from './dto/search-post.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() currentUser) {
    return this.postsService.create(createPostDto, currentUser.uuid)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search posts by content, author, article UUID, or post UUID' })
  findAll(@Query() searchPostDto: SearchPostDto) {
    return this.postsService.search(searchPostDto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page of results to display',
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiOperation({ summary: 'Get all posts created by the current user' })
  @HttpCode(HttpStatus.OK)
  @Get('my-posts')
  async findPostsByAuthor(@CurrentUser() currentUser, @Query('page') page: number, @Query('limit') limit: number) {
    return this.postsService.search({ authorUuid: currentUser.uuid, onlyReplies: false, page, limit })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiOperation({ summary: 'Update a post by its UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles("admin")
  @Patch(':uuid')
  async update(@Param('uuid') uuid: string, @CurrentUser() currentUser) {
    return this.postsService.update(uuid, currentUser.uuid, currentUser.roles)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiOperation({ summary: 'Delete a post by its UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string, @CurrentUser() currentUser) {
    return this.postsService.remove(uuid, currentUser.uuid, currentUser.roles)
  }
}
