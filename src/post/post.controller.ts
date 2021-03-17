import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { PostService } from './post.service';
import { CreatePostDto, CreatePostCommentDto } from './dto';
import { PostsRO, PostRO, PostCommentsRO } from './post.interface';
import { User } from '../user/user.decorator';

import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation, ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('posts')
@Controller('posts')
export class PostController {

  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Return all posts.'})
  @Get()
  async findAll(@Query() query): Promise<PostsRO> {
    return await this.postService.findAll(query);
  }


  @ApiOperation({ summary: 'Get post feed' })
  @ApiResponse({ status: 200, description: 'Return post feed.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('feed')
  async getFeed(@User('id') userId: number, @Query() query): Promise<PostsRO> {
    return await this.postService.findFeed(userId, query);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug): Promise<PostRO> {
    return await this.postService.findOne({slug});
  }

  @Get(':slug/comments')
  async findComments(@Param('slug') slug): Promise<PostCommentsRO> {
    return await this.postService.findComments(slug);
  }

  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({ status: 201, description: 'The post has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  async create(@User('id') userId: number, @Body('post') postData: CreatePostDto) {
    return this.postService.create(userId, postData);
  }

  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 201, description: 'The post has been successfully updated.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put(':slug')
  async update(@Param() params, @Body('post') postData: CreatePostDto) {
    // Todo: update slug also when title gets changed
    return this.postService.update(params.slug, postData);
  }

  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 201, description: 'The post has been successfully deleted.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug')
  async delete(@Param() params) {
    return this.postService.delete(params.slug);
  }

  @ApiOperation({ summary: 'Create comment' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':slug/comments')
  async createComment(@Param('slug') slug, @Body('comment') commentData: CreatePostCommentDto) {
    return await this.postService.addComment(slug, commentData);
  }

  @ApiOperation({ summary: 'Delete comment' })
  @ApiResponse({ status: 201, description: 'The post has been successfully deleted.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug/comments/:id')
  async deleteComment(@Param() params) {
    const {slug, id} = params;
    return await this.postService.deleteComment(slug, id);
  }

  @ApiOperation({ summary: 'Favorite post' })
  @ApiResponse({ status: 201, description: 'The post has been successfully favorited.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':slug/favorite')
  async favorite(@User('id') userId: number, @Param('slug') slug) {
    return await this.postService.favorite(userId, slug);
  }

  @ApiOperation({ summary: 'Unfavorite post' })
  @ApiResponse({ status: 201, description: 'The post has been successfully unfavorited.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug/favorite')
  async unFavorite(@User('id') userId: number, @Param('slug') slug) {
    return await this.postService.unFavorite(userId, slug);
  }

}