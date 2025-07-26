import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { plainToInstance } from 'class-transformer';
import { PostDto } from './dto/post-response.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Article) private articlesRepository: Repository<Article>,
    private usersService: UsersService
  ) { }

  async create(dto: CreatePostDto, authorUuid: string) {

    const authorInfo = await this.usersService.findOneByUuid(authorUuid)
    const newPost = new Post()
    newPost.content = dto.content
    newPost.author = authorInfo

    if (dto.articleUuid) {
      const articleInfo = await this.articlesRepository.findOne({ where: { uuid: dto.articleUuid } })
      if (!articleInfo) {
        throw new NotFoundException("Article not found")
      }
      newPost.article = articleInfo
    }

    if (dto.parentUuid) {
      const parentInfo = await this.postsRepository.findOne({ where: { uuid: dto.parentUuid } })
      if (!parentInfo) {
        throw new NotFoundException("Post not found")
      }
      newPost.replyTo = parentInfo
    }

    await this.postsRepository.save(newPost)

    return plainToInstance(PostDto, newPost, { excludeExtraneousValues: true });
  }

  async search(dto: SearchPostDto) {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.article', 'article')
      .leftJoin('post.replies', 'replies')
      .leftJoinAndSelect('post.replyTo', 'replyTo')
      .loadRelationCountAndMap('post.replyCount', 'post.replies')
      .groupBy('post.id')
      .addGroupBy('author.id')
      .addGroupBy('article.id')
      .addGroupBy('replyTo.id');

    const page = dto.page ?? 0;
    const limit = dto.limit ?? 10;

    if (dto.onlyReplies === true && !dto.postUuid) {
      throw new BadRequestException("You must provide 'postUuid' when using 'onlyReplies: true'");
    }

    if (dto.content) {
      query.andWhere(
        `to_tsvector('simple', post.content) @@ plainto_tsquery('simple', :query)`,
        { query: dto.content },
      );
    }

    if (dto.authorUsername) {
      query.andWhere('author.username ILIKE :username', { username: `%${dto.authorUsername}%` });
    }

    if (dto.authorUuid) {
      query.andWhere('author.uuid ILIKE :uuid', { uuid: `%${dto.authorUuid}%` });
    }

    if (dto.articleUuid) {
      query.andWhere('article.uuid = :articleUuid', { articleUuid: dto.articleUuid });
    }

    if (dto.postUuid && dto.onlyReplies === true) {
      query.andWhere('replyTo.uuid = :replyToUuid', { replyToUuid: dto.postUuid });
    } else if (dto.postUuid) {
      query.andWhere('post.uuid = :postUuid', { postUuid: dto.postUuid });
    }

    query
      .orderBy('post.createdAt', 'ASC')
      .skip(page * limit)
      .take(limit);

    const posts = await query.getManyAndCount();

    return posts.map(post =>
      plainToInstance(PostDto, post, {
        excludeExtraneousValues: true,
      }),
    );
  }

    async update(postUuid: string, userUuid: string, userRoles: string[]) {
    const postInfo = await this.postsRepository.findOne({
      where: {
        uuid: postUuid
      }
    })

    if (!postInfo) {
      throw new NotFoundException(`Post with UUID ${postInfo} not found`);
    }

    const isAdmin = userRoles.includes('admin');
    const isAuthor = postInfo.author.uuid === userUuid;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You are not allowed to delete this article');
    }

    await this.postsRepository.remove(postInfo)
  }

  async remove(postUuid: string, userUuid: string, userRoles: string[]) {
    const postInfo = await this.postsRepository.findOne({
      where: {
        uuid: postUuid
      }
    })

    if (!postInfo) {
      throw new NotFoundException(`Post with UUID ${postInfo} not found`);
    }

    const isAdmin = userRoles.includes('admin');
    const isAuthor = postInfo.author.uuid === userUuid;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You are not allowed to delete this article');
    }

    await this.postsRepository.remove(postInfo)
  }
}
