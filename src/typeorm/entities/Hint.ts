import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Question } from './Question';

@Entity({ name: 'hints' })
@Index('index_hint', ['question'])
export class Hint {

    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'int', unsigned: true })
    // questionId: number; // Ensure both columns are int and unsigned

    @Column({ type: 'longtext'})
    content: string;

    @CreateDateColumn({name:'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name:'updated_at'})
    updatedAt: Date;

    @ManyToOne(() => Question, question => question.answers)   
    @JoinColumn({ name: 'questionId' })
    question: Question;

    // @Column({ type: 'int', unsigned: true })
    // questionId: number; // Ensure both columns are int and unsigned
}
