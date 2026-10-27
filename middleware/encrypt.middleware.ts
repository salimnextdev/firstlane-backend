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
import * as dotenv from 'dotenv';

dotenv.config();
const algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc';
const salt = process.env.ENCRYPTION_SALT || 'salt'; // Use a secure salt in production
const password = process.env.ENCRYPTION_PASSWORD || 'your-password';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();


    return next.handle().pipe(
      map((data) => {
        if (request.route.path.includes('config') || request.route.path.includes('webhook')) {
          return data
        }
        // Encrypt the response data
        const encryptedData = encryptJson(data);
        return encryptedData;
      }),
    );
  }
}

export function encryptJson(data: any) {
  const iv = crypto.randomBytes(16);
  const vi = crypto.randomBytes(32);

  const cipher = crypto.createCipheriv('aes-256-cbc', vi, iv);

  // const cipher = crypto.createCipheriv(algorithm, Buffer.from(key1), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString('hex'),
    vi: vi.toString('hex'),
    content: encrypted.toString('base64'),
  };
}
