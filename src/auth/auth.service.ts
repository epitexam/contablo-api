
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async validateUser(email: string, plainPassword: string): Promise<User> {
        const user = await this.usersService.findOneByUsername(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const validPassword = await user.checkPassword(plainPassword);

        if (!validPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        return user;
    }
}
