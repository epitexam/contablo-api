import { BadGatewayException, BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { plainToInstance } from 'class-transformer';
import { PostDto } from './dto/post-response.dto';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreatePostDto, author: User): Promise<PostDto> {
    return this.dataSource.transaction(async (manager) => {
      const post = new Post();
      post.content = dto.content;
      post.author = author;

      if (dto.articleUuid) {
        const article = await manager.findOne(Article, { where: { uuid: dto.articleUuid } });
        if (!article) throw new NotFoundException('Article not found');
        post.article = article;
      }

      if (dto.parentUuid) {
        const parent = await manager.findOne(Post, { where: { uuid: dto.parentUuid } });
        if (!parent) throw new NotFoundException('Parent post not found');
        post.parent = parent;
      }

      if (!post.parent && !post.article) {
        throw new BadRequestException("The post must be linked to at least one article or one parent post.")
      }

      const savedPost = await manager.save(Post, post);

      const postWithRelations = await manager.findOne(Post, {
        where: { id: savedPost.id },
        relations: ['author', 'children', 'children.author'],
      });

      return plainToInstance(PostDto, postWithRelations, { excludeExtraneousValues: true });
    });
  }

  async search(dto: SearchPostDto): Promise<PostDto[]> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.article', 'article')
      .leftJoinAndSelect('post.children', 'children');

    if (dto.content) {
      query.andWhere('post.content ILIKE :content', { content: `%${dto.content}%` });
    }

    if (dto.postUuid) {
      query.andWhere('post.uuid = :postUuid', { postUuid: dto.postUuid });
    }

    if (dto.articleUuid) {
      query.andWhere('article.uuid = :articleUuid', { articleUuid: dto.articleUuid });
    }

    if (dto.authorUsername) {
      query.andWhere('author.username ILIKE :username', { username: `%${dto.authorUsername}%` });
    }

    query
      .orderBy('post.createdAt', 'DESC')
      .take(dto.limit ?? 10)
      .skip(dto.offset ?? 0);

    const posts = await query.getMany();

    return posts.map((post) =>
      plainToInstance(PostDto, post, { excludeExtraneousValues: true }),
    );
  }

  async findByAuthor(author: User) {
    const posts = await this.postsRepository.find({ where: { author: { uuid: author.uuid } } })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async findOne(id: number) {
    const posts = await this.postsRepository.find({ where: { id } })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async findOneByUuid(uuid: string) {
    const posts = await this.postsRepository.findOne({ where: { uuid } })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async findByArticles(uuid: string) {
    const posts = await this.postsRepository.find({ where: { article: { uuid } } })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async findByParent(uuid: string) {
    const posts = await this.postsRepository.find({ where: { parent: { uuid } } })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async findOneByUuidAndAuthor(uuid: string, author: User) {
    const posts = await this.postsRepository.findOne({ where: { uuid, author: { uuid: author.uuid } } })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async update(uuid: string, updatePostDto: UpdatePostDto) {
    const posts = await this.postsRepository.update({ uuid }, { ...updatePostDto })
    return plainToInstance(PostDto, posts, { excludeExtraneousValues: true });
  }

  async removePostByAuthor(uuid: string, author: User) {

    const post = await this.findOneByUuid(uuid)

    if (!post) {
      throw new NotFoundException("Post not found.")
    }

    const ownedPost = this.findOneByUuidAndAuthor(uuid, author)

    if (!ownedPost) {
      throw new MethodNotAllowedException("You are not allowed to delete this post")
    }

    return this.remove(uuid)
  }

  async remove(uuid: string) {

    const post = await this.findOneByUuid(uuid)

    if (!post) {
      throw new NotFoundException("Post not found.")
    }

    if (post.children) {
      return this.update(uuid, { content: "deleted" })
    }

    return this.postsRepository.delete({ uuid })
  }
}
