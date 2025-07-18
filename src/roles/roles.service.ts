import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {

  constructor(@InjectRepository(Role) private rolesRepository: Repository<Role>) { }

  async create(createRoleDto: CreateRoleDto) {
    const nameAlreadyUsed = await this.findRoleByName(createRoleDto.name)

    if (nameAlreadyUsed) {
      throw new ConflictException("Name already used.")
    }

    return this.rolesRepository.create({ ...createRoleDto })
  }

  findAll() {
    return this.rolesRepository.find()
  }

  async findRoleByName(name: string) {
    const role = await this.rolesRepository.findOne({ where: { name } })

    if (!role) {
      throw new NotFoundException("Role not found")
    }

    return role
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findOne({ where: { id: String(id) } })

    if (!role) {
      throw new NotFoundException("Role not found")
    }

    return role
  }

  async update(name: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findRoleByName(name)
    return this.rolesRepository.update({ name }, { ...updateRoleDto })
  }

  async remove(name: string) {
    const role = await this.findRoleByName(name)
    return this.rolesRepository.remove(role)
  }
}
