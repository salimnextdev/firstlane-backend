import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const salt = 'salt'; // Use a secure salt in production

@Injectable()
export class DecryptInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();

      // Define your password securely, e.g., from an environment variable
      const password = 'your-password'; // Secure this in production

      // Check if the body has both 'iv' and 'content'
      if (request.body && request.body.iv && request.body.content) {
          try {
              // Decrypt the incoming request body
              request.body = decryptJson(request.body, password);
          } catch (error) {
              throw new HttpException('Decryption failed', HttpStatus.BAD_REQUEST);
          }
      } else {
          throw new HttpException('Invalid request body format', HttpStatus.BAD_REQUEST);
      }

      return next.handle();
  }
}
export function decryptJson(encryptedData: { iv: string; content: string }, password: string) {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const key = crypto.scryptSync(password, salt, 32); // Key derivation

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
console.log("JSON.parse(decrypted);",JSON.parse(decrypted))
  return JSON.parse(decrypted);
}