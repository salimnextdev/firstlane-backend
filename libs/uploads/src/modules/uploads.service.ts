import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';

import * as dotenv from 'dotenv';
import { DmsService } from './dms/dms.service';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class UploadsService {
  constructor(private readonly dmsService: DmsService) { }
  getMulterConfig() {
    return {
      storage: diskStorage({
        destination: './uploads', // Directory where files will be stored
        filename: (req, file, callback) => {
          const filename = `${Date.now()}${extname(file.originalname)}`;
          callback(null, filename);
        },
      }),
    };
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    const uploadResults = [];

    for (const file of files) {
      try {
        // const result = await this.uploadToS3(file, folder); ---- we will use cloudinary for now till we pay for the wasabi account
        // const result = await this.uploadToCloudinary(file.buffer, folder);
        // uploadResults.push({
        //   originalname: result.originalname,
        //   url: result.url,

        // });
        const result = await this.uploadToCloudinary(file.buffer, folder);
        uploadResults.push({
          originalname: result.originalname,
          url: result.url,

        });
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        uploadResults.push({
          originalname: file.originalname,
          url: null,

          error: error.message || 'Upload failed',
        });
      }
    }

    return uploadResults;
  }

  private uploadToCloudinary(
    buffer: Buffer,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf'],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  private async uploadToS3(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ originalname: string; url: string }> {
    try {
      const extension = file.originalname.split('.').pop();
      const key = `${folder}/${uuidv4()}.${extension}`;

      const result = await this.dmsService.uploadSingleFile({
        file,
        key,
        isPublic: true,
      });

      return {
        originalname: key,
        url: result.url,
      };
    } catch (error) {
      console.error('❌ Error uploading to S3/Wasabi:', error);
      throw new InternalServerErrorException('Upload to S3 failed');
    }
  }

}
