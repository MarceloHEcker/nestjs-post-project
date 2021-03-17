import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { PostEntity } from './post.entity';
import { PostComment } from './post-comment.entity';
import { UserEntity } from '../user/user.entity';
import { FollowsEntity } from '../profile/follows.entity';
import { CreatePostDto } from './dto';

import {PostRO, PostsRO, PostCommentsRO} from './post.interface';
const slug = require('slug');

@Injectable()
export class PostService {
  constructor(

    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>
  ) {}

  async findAll(query): Promise<PostsRO> {

    const qb = await getRepository(PostEntity)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author');

    qb.where("1 = 1");

    if ('tag' in query) {
      qb.andWhere("post.tagList LIKE :tag", { tag: `%${query.tag}%` });
    }

    if ('author' in query) {
      const author = await this.userRepository.findOne({username: query.author});
      qb.andWhere("post.authorId = :id", { id: author.id });
    }

    if ('favorited' in query) {
      const author = await this.userRepository.findOne({username: query.favorited});
      const ids = author.favorites.map(el => el.id);
      qb.andWhere("post.authorId IN (:ids)", { ids });
    }

    qb.orderBy('post.created', 'DESC');

    const postsCount = await qb.getCount();

    if ('limit' in query) {
      qb.limit(query.limit);
    }

    if ('offset' in query) {
      qb.offset(query.offset);
    }

    const posts = await qb.getMany();

    return {posts, postsCount};
  }

  async findFeed(userId: number, query): Promise<PostsRO> {
    const _follows = await this.followsRepository.find( {followerId: userId});

    if (!(Array.isArray(_follows) && _follows.length > 0)) {
      return {posts: [], postsCount: 0};
    }

    const ids = _follows.map(el => el.followingId);

    const qb = await getRepository(PostEntity)
      .createQueryBuilder('post')
      .where('post.authorId IN (:ids)', { ids });

    qb.orderBy('post.created', 'DESC');

    const postsCount = await qb.getCount();

    if ('limit' in query) {
      qb.limit(query.limit);
    }

    if ('offset' in query) {
      qb.offset(query.offset);
    }

    const posts = await qb.getMany();

    return {posts, postsCount};
  }

  async findOne(where): Promise<PostRO> {
    const post = await this.postRepository.findOne(where);
    return {post};
  }

  async addComment(slug: string, commentData): Promise<PostRO> {
    let post = await this.postRepository.findOne({slug});

    const postComment = new PostComment();
    postComment.body = commentData.body;

    post.postComments.push(postComment);

    await this.postCommentRepository.save(postComment);
    post = await this.postRepository.save(post);
    return {post}
  }

  async deleteComment(slug: string, id: string): Promise<PostRO> {
    let post = await this.postRepository.findOne({slug});

    const comment = await this.postCommentRepository.findOne(id);
    const deleteIndex = post.postComments.findIndex(_comment => _comment.id === comment.id);

    if (deleteIndex >= 0) {
      const deleteComments = post.postComments.splice(deleteIndex, 1);
      await this.postCommentRepository.delete(deleteComments[0].id);
      post =  await this.postRepository.save(post);
      return {post};
    } else {
      return {post};
    }

  }

  async favorite(id: number, slug: string): Promise<PostRO> {
    let post = await this.postRepository.findOne({slug});
    const user = await this.userRepository.findOne(id);

    const isNewFavorite = user.favorites.findIndex(_post => _post.id === post.id) < 0;
    if (isNewFavorite) {
      user.favoritesPost.push(post);
      post.favoriteCount++;

      await this.userRepository.save(user);
      post = await this.postRepository.save(post);
    }

    return {post};
  }

  async unFavorite(id: number, slug: string): Promise<PostRO> {
    let post = await this.postRepository.findOne({slug});
    const user = await this.userRepository.findOne(id);

    const deleteIndex = user.favorites.findIndex(_post => _post.id === post.id);

    if (deleteIndex >= 0) {

      user.favorites.splice(deleteIndex, 1);
      post.favoriteCount--;

      await this.userRepository.save(user);
      post = await this.postRepository.save(post);
    }

    return {post};
  }

  async findComments(slug: string): Promise<PostCommentsRO> {
    const post = await this.postRepository.findOne({slug});
    return {comments: post.postComments};
  }

  async create(userId: number, postData: CreatePostDto): Promise<PostEntity> {

    let post = new PostEntity();
    post.title = postData.title;
    post.description = postData.description;
    post.slug = this.slugify(postData.title);
    post.tagList = postData.tagList || [];
    post.postComments = [];

    const newPost = await this.postRepository.save(post);

    const author = await this.userRepository.findOne({ where: { id: userId }, relations: ['posts'] });
    author.posts.push(post);

    await this.userRepository.save(author);

    return newPost;

  }

  async update(slug: string, postData: any): Promise<PostRO> {
    let toUpdate = await this.postRepository.findOne({ slug: slug});
    let updated = Object.assign(toUpdate, postData);
    const post = await this.postRepository.save(updated);
    return {post};
  }

  async delete(slug: string): Promise<DeleteResult> {
    return await this.postRepository.delete({ slug: slug});
  }

  slugify(title: string) {
    return slug(title, {lower: true}) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
  }
}
