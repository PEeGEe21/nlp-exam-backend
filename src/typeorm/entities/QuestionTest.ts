import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
  } from 'typeorm';
import { DifficultyType } from './DifficultyType';
import { User } from './User';
import { Question } from './Question';
import { Test } from './Test';

  @Entity('question_tests')
  @Index('index_question_test', ['testId', 'questionId'])
  export class QuestionTest {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', name: 'question_id' })
    questionId: number;
  
    @Column({ type: 'int', name: 'test_id' })
    testId: number;
  
    @Column({ type: 'int', name: 'option_answer_type_id', nullable: true })
    optionAnswerTypeId: number;

    @Column({ type: 'longtext', nullable: true })
    question: string;
  
    // @Column({ type: 'longtext', name: 'question_plain', nullable: true })
    // questionPlain: string;

    @Column({ type: 'longtext', nullable: true })
    instruction: string;
  
    @Column({ type: 'double', default: 0 })
    mark: number;
  
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
  
    // Relationships
    @ManyToOne(() => Test)
    @JoinColumn({ name: 'test_id' })
    test: Test;
  
    // @ManyToOne(() => Question)
    // @JoinColumn({ name: 'question_id' })
    // questionRelation: Question;
    @ManyToOne(() => Question, question => question.questionTests)
    @JoinColumn({ name: 'question_id' })
    questionRelation: Question;

    // @ManyToOne(() => DifficultyType)
    // @JoinColumn({ name: 'difficulty_id' })
    // difficulty: DifficultyType;
}
  