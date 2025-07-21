import { Injectable, CanActivate, ExecutionContext, ForbiddenException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndMerge<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException();
    }

    if (user.roles.includes('admin')) {
      return true;
    }

    const hasMatchingRole = requiredRoles.some((role) =>
      user.roles.includes(role),
    );

    if (!hasMatchingRole) {
      throw new ForbiddenException();
    }

    return true;
  }
}
