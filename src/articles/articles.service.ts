import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SearchArticleDto } from './dto/search-article.dto';
import { SingleArticleDto } from './dto/single-article.dto';
import { ArticleListItemDto, ListArticleDto } from './dto/list-article.dto';

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

    const existingArticleBySlug = await this.findOneBySlug(slug);
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
    const { username, published, slug, tags, page = 1, limit = 10, sort = '-createdAt' } = searchDto;

    const qb = this.articlesRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    if (username) {
      qb.andWhere('author.username = :username', { username });
    }
    if (published !== undefined) {
      qb.andWhere('article.published = :published', { published });
    }
    if (slug) {
      qb.andWhere('article.slug = :slug', { slug });
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
    const article = await this.articlesRepository.findOne({ where: { id } });
    if (!article) { throw new NotFoundException(); }
    return article ? this.toSingleArticleDto(article) : null;
  }

  async findArticleByUuidAndAuthor(uuid: string, authorUuid: string) {
    const article = await this.articlesRepository.findOne({
      where: {
        uuid,
        author: {
          uuid: authorUuid
        }
      }
    })
    if (!article) { throw new UnauthorizedException(); }
    return article
  }

  async findOneBySlug(slug: string) {
    const article = await this.articlesRepository.findOne({ where: { slug }, relations: ['author'] });
    if (!article) { throw new NotFoundException(); }
    return article ? this.toSingleArticleDto(article) : null;
  }

  async findOneByUuid(uuid: string) {
    const article = await this.articlesRepository.findOne({ where: { uuid }, relations: ['author'] });
    if (!article) { throw new NotFoundException(); }
    return article ? this.toSingleArticleDto(article) : null;
  }

  async findByAuthor(author: User) {
    const articles = await this.articlesRepository.find({ where: { author: { id: author.id } }, relations: ['author'] });
    return articles.map(this.toSingleArticleDto);
  }

  async update(uuid: string, updateArticleDto: UpdateArticleDto) {
    return this.articlesRepository.update({ uuid }, { ...updateArticleDto })
  }

  remove(uuid: string) {
    return this.articlesRepository.delete({ uuid })
  }
}
