import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity()
export class PostComment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    body: string; 

    @ManyToOne(type => PostEntity, post => post.postComments)
    post: PostEntity;
}