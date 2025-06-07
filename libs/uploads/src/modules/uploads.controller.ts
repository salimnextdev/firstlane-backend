import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UploadedFiles,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomInt, randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { ObjectReturnType, serviceResponse } from '@app/service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('upload')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, getMulterConfig()))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No files uploaded' })
  uploadFile(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): ObjectReturnType {
    // Get the base URL of the current request (protocol + host)
    const host = req.protocol + '://' + req.get('host');

    // Construct the file URLs
    const fileUrls = files?.map((file) => ({
      originalname: file.originalname,
      url: `${host}/v1/upload/file/${file.filename}`, // Full URL for the file
    }));

    return serviceResponse({
      message: fileUrls.length > 0 ? 'Files uploaded successfully' : 'No files were uploaded.',
      data: fileUrls,
      status: fileUrls.length > 0,
    });
  }

  @Get('file/:filename')
  getFile(@Param('filename') filename: string, @Res() res: any) {
    const filePath = join(__dirname, '..', 'uploads', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }

  @Post('cloudinary')
  @ApiOperation({ summary: 'Upload multiple images to Cloudinary' })
  @ApiQuery({ name: 'folder', required: true, type: String, example: 'products' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder: string
  ) {
    if (!folder) {
      throw new BadRequestException('Folder name is required as a query parameter.');
    }

    return this.uploadsService.uploadImages(files, folder);
  }

}

function getMulterConfig() {
  const uploadDir = './uploads';

  // Ensure the upload directory exists
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }

  return {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, callback) => {
        const uniqueId = `${randomInt(999)}-${randomUUID().replace(/\D/g, '').substring(0, 6)}-${Date.now()}`;
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const finalFilename = `${uniqueId}-${sanitizedFilename}`;
        callback(null, finalFilename);
      },
    }),
  };
}
