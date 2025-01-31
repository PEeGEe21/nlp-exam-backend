import { Column, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from './User';

@Entity({ name: 'user_profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    nullable: true
  })
  firstname?: string;

  @Column({
    nullable: true
  })
  lastname?: string;

  @Column({
    default: '',
  })
  username?: string;

  @Transform(({ value }) => value.toLowerCase())
  @Column()
  email: string;

  @Column({
    default: '',
  })
  phonenumber?: string;

  @Column({
    default: '',
  })
  country?: string;

  @Column({
    default: '',
  })
  state?: string;

  @Column({
    default: '',
  })
  address?: string;

  @Column({
    default: 0,
  })
  profile_created: number;

  @DeleteDateColumn()
  deletedAt: Date;

}