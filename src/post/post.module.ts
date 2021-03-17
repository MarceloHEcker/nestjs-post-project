import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../user/user.entity';
import { FollowsEntity } from '../profile/follows.entity';
import { PostService } from './post.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { PostComment } from './post-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostComment, UserEntity, FollowsEntity]), UserModule],
  providers: [PostService],
  controllers: [
    PostController
  ]
})
export class PostModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'posts/feed', method: RequestMethod.GET},
        {path: 'posts', method: RequestMethod.POST},
        {path: 'posts/:slug', method: RequestMethod.DELETE},
        {path: 'posts/:slug', method: RequestMethod.PUT},
        {path: 'posts/:slug/comments', method: RequestMethod.POST},
        {path: 'posts/:slug/comments/:id', method: RequestMethod.DELETE},
        {path: 'posts/:slug/favorite', method: RequestMethod.POST},
        {path: 'posts/:slug/favorite', method: RequestMethod.DELETE});
  }
}
