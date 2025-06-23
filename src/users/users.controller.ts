import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProfileUserDto } from './dto/profile.user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  private async getUserOrThrow(req) {
    const userInfo = await this.usersService.findOneByUuid(req.user.uuid);
    if (!userInfo) {
      throw new UnauthorizedException('User not found or unauthorized');
    }
    return userInfo;
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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the profile of the authenticated user, including all articles they have posted.' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: ProfileUserDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiConflictResponse({ description: 'User profile conflict' })
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({ description: 'Invalid request' })
  async profile(@Request() req) {
    const userInfo = await this.getUserOrThrow(req);
    return this.usersService.findProfileByUuid(userInfo.uuid);
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
    const userInfo = await this.getUserOrThrow(req);
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
    const userInfo = await this.getUserOrThrow(req);
    return this.usersService.remove(userInfo.uuid);
  }
}
