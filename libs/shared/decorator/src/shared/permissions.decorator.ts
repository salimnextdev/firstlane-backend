import { AdminPermission } from '@app/enum';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: AdminPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
