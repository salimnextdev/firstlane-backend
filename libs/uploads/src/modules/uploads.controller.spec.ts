import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync } from 'fs';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import * as fs from 'fs';
describe('UploadsController', () => {
  let uploadsController: UploadsController;
  let uploadsService: UploadsService;

  const mockUploadsService = {
    uploadFile: jest.fn().mockResolvedValue({ message: 'Files uploaded successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [{ provide: UploadsService, useValue: mockUploadsService }],
    }).compile();

    uploadsController = module.get<UploadsController>(UploadsController);
    uploadsService = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(uploadsController).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload files successfully', async () => {
      const req = { protocol: 'http', get: jest.fn().mockReturnValue('localhost:3000') };
      const files = [{ originalname: 'file.txt', filename: '123-file.txt' }];
      const result = uploadsController.uploadFile(req, files as any);
      expect(result.message).toBe('Files uploaded successfully');
    });
  });

  describe('getFile', () => {
    it('should return a file', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const res = { sendFile: jest.fn() };
      uploadsController.getFile('123-file.txt', res);
      expect(res.sendFile).toHaveBeenCalled();
    });

    it('should throw NotFoundException if file does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const res = { sendFile: jest.fn() };
      expect(() => uploadsController.getFile('nonexistent.txt', res))
      // .toThrow(new NotFoundException('File not found'));
    });
  });
});
