import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SearchUserDto } from './dto/search-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { ProfilePublicDto } from './dto/profile.public.user.dto';
import { UsersUtils } from './users.utils';
import { ProfilePrivateDto } from './dto/profile.private.user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) { }

  private async findUserOrFail(uuid: string) {
    const user = await this.usersRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    await UsersUtils.checkUserExists(this.usersRepository, 'email', createUserDto.email);
    await UsersUtils.checkUserExists(this.usersRepository, 'username', createUserDto.username);

    const user = this.usersRepository.create({ ...createUserDto });
    return this.usersRepository.save(user);
  }

  async search(searchDto: SearchUserDto) {
    const query = this.usersRepository.createQueryBuilder('user');

    if (searchDto.uuid) {
      query.andWhere('user.uuid = :uuid', { uuid: searchDto.uuid });
    }

    if (searchDto.username) {
      query.andWhere('user.username ILIKE :username', { username: `%${searchDto.username}%` });
    }

    if (searchDto.firstName) {
      query.andWhere('user.firstName ILIKE :firstName', { firstName: `%${searchDto.firstName}%` });
    }

    if (searchDto.lastName) {
      query.andWhere('user.lastName ILIKE :lastName', { lastName: `%${searchDto.lastName}%` });
    }

    query.andWhere('user.private = :private', { private: false });

    const page = searchDto.page ?? 1;
    const limit = searchDto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [users, total] = await query.skip(skip).take(limit).getManyAndCount();
    const formatted = users.map((user) => new ListUserDto(user));

    return { users: formatted, total, page, take: limit };
  }

  async findProfileByUuid(uuid: string, userUuid?: string, userRoles?: string[]) {
    const userInfo = await this.findUserOrFail(uuid);

    if (!userInfo.isActive) {
      throw new ForbiddenException("This user has deactivated their account.");
    }

    if (userUuid && userRoles) {
      await UsersUtils.validateUserAccess(userInfo, userUuid, userRoles);
      return new ProfilePrivateDto(userInfo);
    }

    if (userInfo.private) {
      throw new ForbiddenException("This profile is private.");
    }

    return new ProfilePublicDto(userInfo);
  }

  async findOneByUuid(uuid: string) {
    return this.findUserOrFail(uuid)
  }

  findUserTokenInfo(email: string) {
    return this.usersRepository.findOne({ where: { email }, relations: ['roles'] })
  }

  async update(userUuid: string, userRoles: string[], updateUserDto: UpdateUserDto) {
    const userInfo = await this.findUserOrFail(userUuid);
    await UsersUtils.validateUserAccess(userInfo, userUuid, userRoles);

    Object.assign(userInfo, updateUserDto);
    return new ProfilePublicDto(await this.usersRepository.save(userInfo));
  }

  async remove(uuid: string, userUuid: string, userRoles: string[]) {
    const userInfo = await this.findUserOrFail(uuid)
    await UsersUtils.validateUserAccess(userInfo, userUuid, userRoles);

    return new ProfilePublicDto(await this.usersRepository.remove(userInfo))
  }
}
