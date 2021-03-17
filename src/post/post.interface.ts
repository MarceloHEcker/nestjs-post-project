import { UserData } from "../user/user.interface";
import { PostEntity } from "./post.entity";

interface PostComment {
    body: string;
}

interface PostData {
    slug: string;
    title: string;
    description: string;
    body?: string;
    tagList?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    favorited?: boolean;
    favoritesCount?: number;
    author?: UserData;
}

export interface PostCommentsRO {
    comments: PostComment[];
}

export interface PostRO {
    post: PostEntity;
}

export interface PostsRO {
    posts: PostEntity[];
    postsCount: number;
}