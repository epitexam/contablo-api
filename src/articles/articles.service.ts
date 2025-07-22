import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { UsersService } from 'src/users/users.service';
import { ArticleListItemDto } from './dto/list-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private articlesRepository: Repository<Article>,
    private userService: UsersService
  ) { }

  async create(createArticleDto: CreateArticleDto, authorUuid: string) {

    const slugAlreadyUsed = await this.findOneByslug(createArticleDto.slug)
    const userInfo = await this.userService.findOneByUuid(authorUuid)

    if (slugAlreadyUsed) {
      throw new ConflictException("Slug already used.")
    }

    const newArticle = this.articlesRepository.create({ ...createArticleDto, author: userInfo })

    return this.articlesRepository.save(newArticle)
  }

  async search(searchDto: SearchArticleDto) {
    const query = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    if (searchDto.title) {
      query.andWhere(`
      to_tsvector('english', article.title || ' ' || coalesce(article.description, '') || ' ' || coalesce(article.content, ''))
      @@ plainto_tsquery('english', :title)
    `, { title: searchDto.title });
    }

    if (searchDto.slug) {
      query.andWhere(`article.slug ILIKE :slug`, { slug: `%${searchDto.slug}%` });
    }

    if (searchDto.username) {
      query.andWhere(`author.username ILIKE :username`, { username: `%${searchDto.username}%` });
    }

    if (searchDto.tags?.length) {
      query.andWhere(`article.tags && ARRAY[:...tags]::text[]`, { tags: searchDto.tags });
    }

    query.orderBy('article.createdAt', 'DESC');

    const page = searchDto.page ?? 1;
    const limit = searchDto.limit ?? 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [articles, total] = await query.getManyAndCount();

    const items: ArticleListItemDto[] = articles.map((article) => ({
      uuid: article.uuid,
      title: article.title,
      slug: article.slug,
      published: article.published,
      createdAt: article.createdAt.toISOString(),
      authorUsername: article.author.username,
      tags: article.tags,
    }));

    return { items, total, page, take: limit };
  }

  async findOneByslug(slug: string) {
    return this.articlesRepository.findOne({ where: { slug } })
  }

  async findArticleByAuthor(uuid: string, page: number, limit: number) {

    const [articles, count] = await this.articlesRepository.findAndCount({
      where: { author: { uuid } },
      skip: ((Number(page) || 1) - 1) * (Number(limit) || 10),
      take: Number(limit) || 10,
    });

    const items: ArticleListItemDto[] = articles.map((article) => ({
      uuid: article.uuid,
      title: article.title,
      slug: article.slug,
      published: article.published,
      createdAt: article.createdAt.toISOString(),
      authorUsername: article.author.username,
      tags: article.tags,
    }));

    return {
      items,
      count,
      page: ((Number(page) || 1) - 1) * (Number(limit) || 10),
      take: Number(limit) || 10,
    };
  }

  async findOneByuuid(uuid: string) {
    const article = await this.articlesRepository.findOne({ where: { uuid } })

    if (!article) {
      throw new NotFoundException("Article not found.")
    }

    return article
  }


  async updateArticle(articleUuid: string, userUuid: string, userRoles: string[], updateArticleDto: UpdateArticleDto,) {
    const article = await this.articlesRepository.findOne({ where: { uuid: articleUuid }, relations: ['author'] });

    if (!article) {
      throw new NotFoundException(`Article not found.`);
    }

    const isAdmin = userRoles.includes('admin');
    const isAuthor = article.author.uuid === userUuid;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You are not allowed to edit this article.');
    }

    if (updateArticleDto.slug) {
      const slugAlreadyUsed = await this.findOneByslug(updateArticleDto.slug)

      if (slugAlreadyUsed) {
        throw new ConflictException("Slug already used.")
      }
    }

    Object.assign(article, updateArticleDto);

    return await this.articlesRepository.save(article);
  }

  async deleteArticle(articleUuid: string, userUuid: string, roles: string[],) {
    const article = await this.articlesRepository.findOne({ where: { uuid: articleUuid }, relations: ['author'] });

    if (!article) {
      throw new NotFoundException(`Article with UUID ${articleUuid} not found`);
    }

    const isAdmin = roles.includes('admin');
    const isAuthor = article.author.uuid === userUuid;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You are not allowed to delete this article');
    }

    await this.articlesRepository.remove(article);
  }

}