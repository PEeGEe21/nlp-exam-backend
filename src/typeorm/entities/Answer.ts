import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Question } from './Question';

@Entity({ name: 'answers' })
// @Index('index_answer', ['questionId'])
export class Answer {

   
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'int', unsigned: true })
    // questionId: number; // Ensure both columns are int and unsigned

    @Column({ type: 'int', unsigned: true })
    isCorrect: number;

    @Column({ type: 'longtext' })
    value: string;

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
