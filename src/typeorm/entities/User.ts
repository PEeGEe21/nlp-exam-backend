import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Profile } from './Profile';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true})
  email: string;

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

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

}
