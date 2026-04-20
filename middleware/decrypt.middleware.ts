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
import * as dotenv from 'dotenv';
dotenv.config();
import * as crypto from 'crypto';
import { encryptJson } from './encrypt.middleware';

const algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc';
const salt = process.env.ENCRYPTION_SALT || 'salt'; // Use a secure salt in production
const password = process.env.ENCRYPTION_PASSWORD || 'your-password';

@Injectable()
export class DecryptInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // request.body =encryptJson(request.body);

    // if it is a Get request or the route is has upload then no need to decrypt the body
    if (request.method === 'GET' || request.route.path.includes('login') ||
      request.route.path.includes('webhook') || request.route.path.includes('upload') || request.route.path.includes('config')) {
      return next.handle();
    }

    if (request.body && Object.keys(request?.body).length > 0) {
      if (request.body.iv && request.body.content) {
        try {
          // Decrypt the incoming request body
          request.body = decryptJson(request.body, password);
        } catch (error) {
          throw new HttpException('Decryption failed', HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException(
          'Invalid request body format',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return next.handle();
  }
}
export function decryptJson(
  encryptedData: { vi: string; iv: string; content: string },
  password: string,
) {
  // console.log("encryptedData",encryptedData)
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const vi = Buffer.from(encryptedData.vi, 'hex');
  const encryptedText = Buffer.from(encryptedData.content, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', vi, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());

}
