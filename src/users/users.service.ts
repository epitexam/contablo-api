import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SearchUserDto } from './dto/search-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }

  async create(createUserDto: CreateUserDto) {
    const { email, username } = createUserDto;

    const existingEmail = await this.findOneByEmail(email);
    if (existingEmail) { throw new ConflictException("Email already in use") }

    const existingUsername = await this.findOneByUsername(username);
    if (existingUsername) { throw new ConflictException("Username already in use") }

    return this.usersRepository.save(this.usersRepository.create(createUserDto))
  }

  findAll() {
    return this.usersRepository.find()
  }

  async search({ firstName, lastName, username, page = 1, pageSize = 10 }: SearchUserDto) {
    const query = this.usersRepository.createQueryBuilder('user');

    if (firstName) {
      query.andWhere('user.firstName % :firstName', { firstName });
    }

    if (lastName) {
      query.andWhere('user.lastName % :lastName', { lastName });
    }

    if (username) {
      query.andWhere('user.username % :username', { username });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [users, total] = await query.getManyAndCount();
    const formattedUsers = users.map(user => new UserResponseDto(user));

    return { users: formattedUsers, pagination: { page, pageSize, total } };
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } })
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } })
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } })
  }

  findOneByUuid(uuid: string) {
    return this.usersRepository.findOne({ where: { uuid } })
  }

  update(uuid: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update({ uuid }, updateUserDto)
  }

  remove(uuid: string) {
    return this.usersRepository.delete({ uuid })
  }
}
