import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Profile } from './Profile';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true, nullable: true })
  username: string;

  @Transform(({ value }) => value.toLowerCase())
  @Column({ unique: true})
  email: string;

  @Column({ unique: true, nullable: true })
  staffId: string;

  @Column({ unique: true, nullable: true })
  matricNo: string;

  @Column({ nullable: true })
  level: number;

  @Column({ nullable: true })
  department: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 'student'})
  user_role: string;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  auth_strategy: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToOne(() => Profile, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  profile: Profile;

  @DeleteDateColumn()
  deletedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

}
