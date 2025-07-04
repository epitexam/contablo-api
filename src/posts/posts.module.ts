import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UsersModule } from 'src/users/users.module';
import { ArticlesModule } from 'src/articles/articles.module';

@Module({
  imports: [UsersModule, ArticlesModule,TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
  exports:[PostsModule]
})
export class PostsModule { }
