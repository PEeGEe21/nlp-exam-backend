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
  
    @Column({ type: 'int', name: 'position_id', nullable: true })
    positionId: number;
  
    @Column({ type: 'int', name: 'user_id', nullable: true })
    userId: number;
  
    @Column({ type: 'int', name: 'difficulty_id', default: 1 })
    difficultyId: number;
  
    @Column({ type: 'int', name: 'topic_id', nullable: true })
    topicId: number;
  
    @Column({ type: 'int', name: 'option_answer_type_id', nullable: true })
    optionAnswerTypeId: number;
  
    @Column({ type: 'int', name: 'option_type_id', default: 1 })
    optionTypeId: number;
  
    @Column({ type: 'int', name: 'is_editor', default: 0 })
    isEditor: number;
  
    @Column({ type: 'int', name: 'is_exam', default: 0 })
    isExam: number;
  
    @Column({ type: 'longtext', nullable: true })
    question: string;
  
    @Column({ type: 'longtext', name: 'question_plain', nullable: true })
    questionPlain: string;
  
    @Column({ type: 'text', nullable: true })
    tags: string;
  
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
  
    @ManyToOne(() => Question)
    @JoinColumn({ name: 'question_id' })
    questionRelation: Question;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => DifficultyType)
    @JoinColumn({ name: 'difficulty_id' })
    difficulty: DifficultyType;
}
  