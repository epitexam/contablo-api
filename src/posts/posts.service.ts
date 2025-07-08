import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { plainToInstance } from 'class-transformer';
import { PostDto } from './dto/post-response.dto';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Article) private articlesRepository: Repository<Article>
  ) { }

  async create(dto: CreatePostDto, author: User) {

    const newPost = new Post()
    newPost.content = dto.content
    newPost.author = author

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

    const {
      postUuid,
      articleUuid,
      authorUsername,
      content,
      onlyReplies,
      limit = 10,
      page = 0,
    } = dto;

    if (String(onlyReplies) === "true" && !postUuid) {
      throw new BadRequestException("You must provide 'postUuid' when using 'onlyReplies: true'");
    }

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

    if (content) {
      query.andWhere('post.content ILIKE :content', { content: `%${content}%` });
    }

    if (authorUsername) {
      query.andWhere('author.username ILIKE :username', { username: `%${authorUsername}%` });
    }

    if (articleUuid) {
      query.andWhere('article.uuid = :articleUuid', { articleUuid });
    }

    if (postUuid && String(onlyReplies) === "true") {
      query.andWhere('replyTo.uuid = :postUuid', { postUuid });
    } else if (postUuid) {
      query.andWhere('post.uuid = :postUuid', { postUuid });
    }

    query
      .orderBy('post.createdAt', 'ASC')
      .take(limit)
      .skip(page * limit);

    const posts = await query.getMany();

    return posts.map((post) => plainToInstance(PostDto, post, { excludeExtraneousValues: true }));
  }

  async findOne(id: number) {
    const posts = await this.postsRepository.findOne({ where: { id } })
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
    const posts = await this.postsRepository.find({ where: { replyTo: { uuid } } })
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

    if (post.replies) {
      return this.update(uuid, { content: "deleted" })
    }

    return this.postsRepository.delete({ uuid })
  }
}
