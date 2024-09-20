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
import { QuestionTest } from './QuestionTest';
import { Test } from './Test';
import { Result } from './Result';

@Entity('result_scores')
@Index('index_result_score', ['resultId', 'questionId', 'questionTestId'])
export class ResultsScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  resultId: number;

  @Column({ type: 'int' })
  questionId: number;

  @Column({ type: 'varchar', default: '0' })
  score: string;

  @Column({ type: 'boolean', default: true })
  scored: boolean;

  @Column({ type: 'json', nullable: true })
  answer: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  state: number;

  @Column({ type: 'longtext', nullable: true })
  comments: string;

  @Column({ type: 'int', nullable: true })
  questionTestId: number;

  @Column({ type: 'decimal', precision: 30, scale: 2, nullable: true })
  time: number;

  @Column({ type: 'longtext', nullable: true })
  studentAnswer: string;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'longtext', nullable: true })
  correctAnswer: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Result, (result) => result.scores)
  @JoinColumn({ name: 'result_id' })
  result: Result;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @ManyToOne(() => QuestionTest)
  @JoinColumn({ name: 'question_test_id' })
  question: QuestionTest;

  // Static method for ScopeByFilter-like functionality
  static byFilter(query: any, data: Record<string, any>) {
    const whereClause: string[] = [];
    const whereParam: any[] = [];

    for (const key in data) {
      whereClause.push(`${key} = ?`);
      whereParam.push(data[key]);
    }

    return query.whereRaw(whereClause.join(' and '), whereParam);

  }
}