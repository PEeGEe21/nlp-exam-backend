import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    OneToOne,
    OneToMany
  } from 'typeorm';
import { User } from './User';
import { DifficultyType } from './DifficultyType';
import { OptionType } from './OptionType';
import { Answer } from './Answer';
import { QuestionTest } from './QuestionTest';

  @Entity('questions')
  @Index('index_question', ['userId'])
  export class Question {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', name: 'user_id' })
    userId: number;
  
    @Column({ type: 'int', name: 'difficulty_id' })
    difficultyId: number;
  
    @Column({ type: 'int', name: 'option_type_id'})
    optionTypeId: number;
  
    @Column({ type: 'int', name: 'is_editor', default: 0, nullable: true })
    isEditor: number;
  
    @Column({ type: 'longtext' })
    question: string;
  
    @Column({ type: 'longtext', name: 'question_plain', nullable: true })
    questionPlain: string;
  
    // @Column({ type: 'text', nullable: true })
    // tags: string;
  
    @Column({ type: 'double', default: 0, nullable: true })
    marks: number;
  
    @Column({ type: 'longtext', nullable: true })
    instruction: string;

    @Column({ type: 'longtext', nullable: true })
    answer_explanation: string;
  
    // @Column({ type: 'int', name: 'option_answer_type_id', default: 1, nullable: true })
    // optionAnswerTypeId: number;
  
    // @Column({ type: 'boolean', name: 'is_exam', default: false })
    // isExam: boolean;
  
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
  
    // Relationships
    // @OneToOne(() => User)
    // @JoinColumn({ name: 'user_id' })
    // user: User;

    // Relationships
    @OneToOne(() => QuestionTest)
    @JoinColumn({ name: 'question_test_id' })
    questionTest: QuestionTest;
  
    // @OneToOne(() => DifficultyType)
    // @JoinColumn({ name: 'difficulty_id' })
    // difficulty: DifficultyType;
  
    // @OneToOne(() => OptionType)
    // @JoinColumn({ name: 'option_type_id' })
    // optionType: OptionType;

    @OneToMany(() => Answer, (answer) => answer.question)
    answers: Answer[];

  }
  