// src/interceptors/encryption.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const salt = 'salt'; // Use a secure salt in production

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      // Define your password securely, e.g., from an environment variable
      const password = 'your-password';

      return next.handle().pipe(
          map((data) => {
              // Encrypt the response data
              const encryptedData = encryptJson(data, password);
              return encryptedData;
          }),
      );
  }
}


export function encryptJson(data: any, password: string) {
  const iv = crypto.randomBytes(16); // Initialization vector
  const key = crypto.scryptSync(password, salt, 32); // Key derivation

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
      iv: iv.toString('hex'),
      content: encrypted
  };
}