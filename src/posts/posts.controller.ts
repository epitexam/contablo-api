import { Controller, Get, Post, Body, Param, Delete, UseGuards, UnauthorizedException, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/users.decoraters';
import { SearchPostDto } from './dto/search-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) { }

  private async getUserOrThrow(user): Promise<User> {
    const userInfo = await this.usersService.findOneByUuid(user.uuid);
    if (!userInfo) {
      throw new UnauthorizedException('User not found or unauthorized');
    }
    return userInfo;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() currentUser) {
    const userInfo = await this.getUserOrThrow(currentUser)
    return this.postsService.create(createPostDto, userInfo)
  }

  @Get()
  @ApiOperation({ summary: 'Search posts by content, author, article UUID, or post UUID' })
  findAll(@Query() searchPostDto: SearchPostDto) {
    return this.postsService.search(searchPostDto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiOperation({ summary: 'Get all posts created by the current user' })
  @HttpCode(HttpStatus.OK)
  @Get('my-posts')
  async findPostsByAuthor(@CurrentUser() currentUser) {
    const userInfo = await this.getUserOrThrow(currentUser)
    return this.postsService.findByAuthor(userInfo)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiOperation({ summary: 'Delete a post by its UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string, @CurrentUser() currentUser) {
    const userInfo = await this.getUserOrThrow(currentUser)
    return this.postsService.removePostByAuthor(uuid, userInfo)
  }
}
