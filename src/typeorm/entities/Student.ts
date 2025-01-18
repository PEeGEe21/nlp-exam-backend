import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('students')
export class Student{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, {
        cascade: true,
        eager: true,
        onDelete: 'CASCADE'  // This will cascade both soft deletes and saves
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}