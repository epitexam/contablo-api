import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates a user\'s information by UUID.',
  })
  @ApiNoContentResponse({ description: 'User updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  async update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userInfo = await this.usersService.findOneByUuid(req.user.uuid);
    if (!userInfo) throw new NotFoundException('User not found');
    return this.usersService.update(userInfo.uuid, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user by UUID.',
  })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async remove(@Request() req) {
    const userInfo = await this.usersService.findOneByUuid(req.user.uuid);
    if (!userInfo) throw new NotFoundException('User not found');
    return this.usersService.remove(userInfo.uuid);
  }
}
