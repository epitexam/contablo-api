import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { Article } from './articles/entities/article.entity';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'test',
      entities: [User, Article, Post, Role],
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.TTL as string, 10) || 60000,
      limit: parseInt(process.env.LIMIT as string, 10) || 950,
    }]),
    UsersModule,
    AuthModule,
    ArticlesModule,
    PostsModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
