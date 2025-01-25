import * as moment from 'moment';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { OptionType } from './OptionType';
import { DifficultyType } from './DifficultyType';
import { QuestionTest } from './QuestionTest';
import { Result } from './Result';

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'double', name: 'mark_per_question', default: 0 })
  markPerQuestion: number;

  @Column({ type: 'double', name: 'total_questions', default: 0})
  totalQuestions: number;

  @Column({ type: 'double', name: 'total_marks', default: 0})
  totalMarks: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'int', name: 'result_published', default: 0})
  resultPublished: number;

  @Column({ type: 'int',  default: 0})
  shuffle: number;

  @Column({ type: 'int', name: 'shuffle_answer', default: 0 })
  shuffleAnswer: number;

  @Column({ type: 'int', name: 'view_correct_answer',  default: 0 })
  viewCorrectAnswer: number;

  @Column({ type: 'int', name: 'show_hints',  default: 0 })
  showHints: number;

  @Column({ type: 'int', name: 'auto_publish',  default: 0 })
  autoPublish: number;

  @Column({ type: 'int', name: 'is_published', default: 0 })
  isPublished: number;

  @Column({ type: 'int', name: 'duration_hours' })
  durationHours: number;

  @Column({ type: 'int', name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'timestamp', name: 'start_date', nullable: true, 
    transformer: { 
      to: (value) => value, 
      from: (value) => moment(value).format('YYYY-MM-DD HH:mm:ss') 
    }
  })
  startDate: Date;

  @Column({ type: 'timestamp', name: 'end_date', nullable: true, 
    transformer: { 
      to: (value) => value, 
      from: (value) => moment(value).format('YYYY-MM-DD HH:mm:ss') 
    }
  })
  endDate: Date;

  @Column({ type: 'int', name: 'type', default: 1 })
  type: number;

  @Column({ type: 'longtext' })
  instructions: string;

  @Column({ type: 'int', name: 'is_random_questions', default: 0 })
  isRandomQuestions: number;

  @Column({ type: 'int', name: 'max_no_question', default: 0 })
  maxNoQuestion: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships

  @ManyToOne(() => DifficultyType)
  @JoinColumn({ name: 'difficulty_id' })
  difficulty: DifficultyType;

  @ManyToOne(() => OptionType)
  @JoinColumn({ name: 'option_type_id' })
  optionType: OptionType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => QuestionTest, (question) => question.test)
  questions: QuestionTest[];

  @OneToMany(() => Result, (result) => result.test)
  results: Result[];
}
