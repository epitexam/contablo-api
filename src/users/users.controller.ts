import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User successfully created' })
  @ApiBadRequestResponse({ description: 'Invalid user input' })
  @ApiConflictResponse({ description: 'Username/Email already in use' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search for users' })
  @ApiOkResponse({ description: 'List of users matching search criteria' })
  @ApiBadRequestResponse({ description: 'Invalid pagination or search parameters' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Search users by first name' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Search users by last name' })
  @ApiQuery({ name: 'username', required: false, description: 'Search users by username' })
  @ApiQuery({ name: 'uuid', required: false, description: 'Search users by UUID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Results per page', type: Number, example: 10 })
  async searchUsers(@Query() searchDto: SearchUserDto) {
    if (searchDto.page < 1 || searchDto.pageSize < 1)
      throw new BadRequestException('Page et taille de page doivent être positives.');
    return await this.usersService.search(searchDto);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get user by UUID' })
  @ApiOkResponse({ description: 'User data retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'uuid', description: 'UUID of the user to retrieve' })
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findOneByUuid(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates a user\'s information by UUID.',
  })
  @ApiNoContentResponse({ description: 'User updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  @ApiParam({ name: 'uuid', description: 'UUID of the user to update' })
  async update(@Param('uuid') uuid: string, @Body() updateUserDto: UpdateUserDto) {
    const userInfo = await this.usersService.findOneByUuid(uuid);
    if (!userInfo) throw new NotFoundException('User not found');
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user by UUID.',
  })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'uuid', description: 'UUID of the user to delete' })
  async remove(@Param('uuid') uuid: string) {
    const userInfo = await this.usersService.findOneByUuid(uuid);
    if (!userInfo) throw new NotFoundException('User not found');
    return this.usersService.remove(uuid);
  }
}
