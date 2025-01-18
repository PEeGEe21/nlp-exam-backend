export class CreateUserDto {
  email: string;
  password: string;
  user_role?: string;
  fname?: string;
  lname?: string;
}
