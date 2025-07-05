import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, MethodNotAllowedException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SearchArticleDto } from './dto/search-article.dto';
import { SingleArticleDto } from './dto/single-article.dto';
import { ArticleListItemDto, ListArticleDto } from './dto/list-article.dto';

type ActionType = 'delete' | 'update';

@Injectable()
export class ArticlesService {
  constructor(@InjectRepository(Article) private articlesRepository: Repository<Article>) { }

  private toSingleArticleDto(article: Article): SingleArticleDto {
    return {
      uuid: article.uuid,
      title: article.title,
      description: article.description,
      content: article.content,
      slug: article.slug,
      published: article.published,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      tags: article.tags,
      authorUsername: article.author?.username,
    };
  }

  private toArticleListItemDto(article: Article): ArticleListItemDto {
    return {
      uuid: article.uuid,
      title: article.title,
      slug: article.slug,
      published: article.published,
      createdAt: article.createdAt.toISOString(),
      authorUsername: article.author.username,
      tags: article.tags || [],
    };
  }

  async create(createArticleDto: CreateArticleDto, author: User) {
    const slug = createArticleDto.slug || createArticleDto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const existingArticleBySlug = await this.articlesRepository.findOne({ where: { slug } });
    if (existingArticleBySlug) { throw new ConflictException(`Article with slug "${slug}" already exists`); }

    const article = await this.articlesRepository.save(
      this.articlesRepository.create({
        ...createArticleDto,
        author,
        slug,
        published: createArticleDto.published || false,
        tags: createArticleDto.tags || [],
      }),
    );
    return this.toSingleArticleDto(article);
  }

  async search(searchDto: SearchArticleDto) {
    const {
      username,
      title,
      slug,
      tags,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = searchDto;

    const qb = this.articlesRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    qb.andWhere('article.published = :published', { published: true });

    if (username) {
      qb.andWhere('author.username ILIKE :username', { username: `%${username}%` });
    }
    if (title) {
      qb.andWhere('article.title ILIKE :title', { title: `%${title}%` });
    }
    if (slug) {
      qb.andWhere('article.slug ILIKE :slug', { slug: `%${slug}%` });
    }
    if (tags && Array.isArray(tags) && tags.length > 0) {
      qb.andWhere('article.tags && :tags', { tags });
    }

    const allowedSortFields = ['createdAt', 'title', 'slug', 'published'];
    if (sort) {
      const order: 'ASC' | 'DESC' = sort.startsWith('-') ? 'DESC' : 'ASC';
      const field = sort.replace('-', '');
      if (allowedSortFields.includes(field)) {
        qb.orderBy(`article.${field}`, order);
      } else {
        qb.orderBy('article.createdAt', 'DESC');
      }
    } else {
      qb.orderBy('article.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [articles, total] = await qb.getManyAndCount();
    const items = articles.map(this.toArticleListItemDto);
    return { articles: items, total };
  }

  async findAll() {
    const articles = await this.articlesRepository.find({ relations: ['author'] });
    const items = articles.map(this.toArticleListItemDto);
    return { articles: items, total: items.length };
  }

  async findOne(id: number) {
    const article = await this.articlesRepository.findOne({ where: { id }, relations: ['author'] });
    return article ? this.toSingleArticleDto(article) : null;
  }

  async findArticleByUuidAndAuthor(articleUuid: string, author: User) {
    const article = await this.articlesRepository.findOne({
      where: {
        uuid: articleUuid,
        author,
      },
      relations: ['author'],
    });
    if (!article) { throw new UnauthorizedException(); }
    return this.toSingleArticleDto(article);
  }

  async findOneBySlug(slug: string) {
    const article = await this.articlesRepository.findOne({ where: { slug }, relations: ['author'] });
    if (!article) {
      throw new NotFoundException("Article not found.")
    }
    return this.toSingleArticleDto(article)
  }

  async findOneByUuid(uuid: string) {
    const article = await this.articlesRepository.findOne({ where: { uuid }, relations: ['author'] });
    if (!article) {
      throw new NotFoundException("Article not found.")
    }
    return this.toSingleArticleDto(article)
  }

  async findByAuthor(author: User, take: number = 10, skip: number = 1) {
    const articles = await this.articlesRepository.find({ where: { author: { id: author.id } }, take, skip, relations: ['author'] });
    return articles.map(this.toSingleArticleDto);
  }

  async performActionByAuthor(uuid: string, author: User, action: ActionType, updateArticleDto?: UpdateArticleDto) {
    const article = await this.findOneByUuid(uuid);

    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    const articleOwnedByAuthor = await this.findArticleByUuidAndAuthor(uuid, author);
    if (!articleOwnedByAuthor) {
      throw new MethodNotAllowedException('You are not allowed to perform this action.');
    }

    switch (action) {
      case 'delete':
        return this.remove(uuid);
      case 'update':
        if (!updateArticleDto) {
          throw new BadRequestException('Update data is required.');
        }
        return this.update(uuid, updateArticleDto);
      default:
        throw new InternalServerErrorException('Invalid action provided.');
    }
  }

  async update(uuid: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.findOneByUuid(uuid);
    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return this.articlesRepository.update({ uuid }, { ...updateArticleDto });
  }

  async remove(uuid: string) {
    const article = await this.findOneByUuid(uuid);
    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return this.articlesRepository.delete({ uuid });
  }

}