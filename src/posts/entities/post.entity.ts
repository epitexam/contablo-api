import { Article } from "src/articles/entities/article.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, default: uuidv4() })
    uuid: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, (user) => user.posts, { eager: true, onDelete: 'CASCADE' })
    author: User;

    @ManyToOne(() => Article, (article) => article.comments, { nullable: true, onDelete: 'CASCADE' })
    article: Article;

    @ManyToOne(() => Post, (post) => post.replies, { nullable: true, onDelete: 'CASCADE' })
    replyTo: Post;

    @OneToMany(() => Post, (post) => post.replyTo)
    replies: Post[];

    @CreateDateColumn()
    createdAt: Date;

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }
}
