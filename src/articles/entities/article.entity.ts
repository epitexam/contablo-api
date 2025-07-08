import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeInsert } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Post } from 'src/posts/entities/post.entity';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, default: uuidv4() })
    uuid: string;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ unique: true, length: 255 })
    slug: string;

    @Column({ default: false })
    published: boolean;

    @ManyToOne(() => User, user => user.articles, { eager: true, nullable: false })
    author: User;

    @OneToMany(() => Post, (post) => post.article)
    comments: Post[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('text', { array: true, default: [] })
    tags: string[];

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }
}
