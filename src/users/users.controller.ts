import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';
import { UsersService } from './users.service';
import { CurrentUser } from './users.decoraters';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfilePrivateDto } from './dto/profile.private.user.dto';
import { ProfilePublicDto } from './dto/profile.public.user.dto';

@ApiTags('Users')
@ApiBearerAuth('jwt-access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for users',
    description: 'Returns paginated list of users matching search criteria'
  })
  async searchUsers(@Query() searchDto: SearchUserDto) {
    return await this.usersService.search(searchDto);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns complete profile data including private information for authenticated user'
  })
  @ApiResponse({ status: 200, type: ProfilePrivateDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async profile(@CurrentUser() currentUser) {
    return this.usersService.findProfileByUuid(currentUser.uuid, currentUser.uuid, currentUser.roles);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public user profile',
    description: 'Returns public profile data for specified user UUID'
  })
  @ApiParam({ name: 'uuid', description: 'Valid user UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, type: ProfilePublicDto })
  @ApiResponse({ status: 403, description: 'Forbidden if profile is private' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findProfileByUuid(uuid);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current user',
    description: 'Updates authenticated user profile information',
  })
  @ApiResponse({ status: 200, type: ProfilePrivateDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@CurrentUser() currentUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(currentUser.uuid, currentUser.roles, updateUserDto)
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently deletes user account (admin or owner only)',
  })
  @ApiParam({ name: 'uuid', description: 'UUID of user to delete', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden if not admin or owner' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@CurrentUser() currentUser, @Param('uuid') uuid: string) {
    return this.usersService.remove(uuid, currentUser.uuid, currentUser.roles)
  }
}