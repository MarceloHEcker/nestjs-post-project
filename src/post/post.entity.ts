import { BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { PostComment } from "./post-comment.entity";

@Entity('post')
export class PostEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    slug: string;

    @Column()
    title: string;

    @Column({default: ''})
    description: string;

    @Column({default: ''})
    body: string; 

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
    created: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date;
    }

    @Column('simple-array')
    tagList: string[];

    @ManyToOne(type => UserEntity, user => user.posts)
    author: UserEntity;

    @OneToMany(type => PostComment, postComment => postComment.post, {eager: true})
    @JoinColumn()
    postComments: PostComment[];

    @Column({default: 0})
    favoriteCount: number;
}