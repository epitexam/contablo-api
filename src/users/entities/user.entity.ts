import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import * as argon2 from "argon2";
import { v4 as uuidv4 } from 'uuid';
import { Article } from '../../articles/entities/article.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, default: uuidv4() })
    uuid: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    firstName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    lastName: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatarUrl: string;

    @OneToMany(() => Post, (post) => post.author)
    posts: Post[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Article, article => article.author)
    articles: Article[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password = await argon2.hash(this.password);
        }
    }

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }

    async checkPassword(plainPassword: string): Promise<boolean> {
        return await argon2.verify(this.password, plainPassword);
    }
}