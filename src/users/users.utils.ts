import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { ConflictException, ForbiddenException } from "@nestjs/common";

export class UsersUtils {
    static async checkUserExists(repository: Repository<User>, field: string, value: any) {
        const existing = await repository.findOne({ where: { [field]: value } });
        if (existing) {
            throw new ConflictException(`${field} already in use.`);
        }
    }

    static async validateUserAccess(userInfo: User, userUuid: string, userRoles: string[]) {
        const isAdmin = userRoles.includes('admin');
        const isUser = userInfo.uuid === userUuid;

        if (!isAdmin && !isUser) {
            throw new ForbiddenException('You are not allowed to perform this action');
        }
    }
}