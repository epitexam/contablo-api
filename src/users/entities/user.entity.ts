import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as argon2 from "argon2";
import { v4 as uuidv4 } from 'uuid';

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password = await argon2.hash(this.password);
        }
    }

    async checkPassword(plainPassword: string): Promise<boolean> {
        return await argon2.verify(this.password, plainPassword);
    }
}
