import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
import { User } from './User';
import { Test } from './Test';
import { Student } from './Student';
import { ResultsScore } from './ResultsScore';

@Entity('results')
export class Result {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'int' })
    // studentId: number;

    @Column({ type: 'int' })
    testId: number;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    serverEndDate: Date;

    @Column({ type: 'int', nullable: true })
    duration: number;

    @Column({ type: 'double', nullable: true })
    totalScored: number;

    @Column({ type: 'int', default: 0 })
    manualLock: number;

    @Column({ type: 'int', nullable: true })
    totalCount: number;

    @Column({ type: 'int', nullable: true })
    totalMarks: number;

    @Column({ type: 'simple-array', nullable: true })
    questionTestIds: number[];  // Array type for question_test_ids

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => ResultsScore, (score) => score.result)
    scores: ResultsScore[];

    @ManyToOne(() => Test)
    @JoinColumn({ name: 'test_id' })
    test: Test;


    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;
  
    // Static states
    static readonly notAttended = 0;
    static readonly viewed = 1;
    static readonly attended = 2;
    static readonly timeColor = 'green';
  
    static readonly states = {
      0: 'not_attended',
      1: 'viewed',
      2: 'attended',
    };
  
    static readonly selectionAll = 1;
    static readonly selectionDateRange = 2;
  
    // ScopeByFilter-like method in NestJS
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