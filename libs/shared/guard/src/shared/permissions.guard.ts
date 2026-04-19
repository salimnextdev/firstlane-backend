import { PERMISSIONS_KEY } from '@app/decorator';
import { AdminPermission } from '@app/enum';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<AdminPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super Admin has all permissions
    if (user.isSuperAdmin) {
      return true;
    }

    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin');
    }

    if (!user.permissions) {
      throw new ForbiddenException('User has no permissions assigned');
    }

    const hasPermission = requiredPermissions.some((permission) => 
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required permissions to access this resource');
    }
    
    return true;
  }
}
