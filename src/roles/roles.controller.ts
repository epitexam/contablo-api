import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './roles.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-access-token')
  @Roles('admin')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-access-token')
  @Roles('admin')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-access-token')
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-access-token')
  @Roles('admin')
  @Patch(':name')
  update(@Param('name') name: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(name, updateRoleDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('jwt-access-token')
  @Roles('admin')
  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.rolesService.remove(name);
  }
}
