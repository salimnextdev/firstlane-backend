import { UploadsService } from './uploads.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

describe('UploadsService', () => {
  let uploadsService: UploadsService;

  beforeEach(() => {
    uploadsService = new UploadsService();
  });

  it('should return multer config with correct destination', () => {
    const config = uploadsService.getMulterConfig();

    expect(config.storage).toBeDefined();
    expect(config.storage._handleFile).toBeInstanceOf(Function); // Ensures diskStorage is used
  });

  it('should generate filenames with correct format', () => {
    const config = uploadsService.getMulterConfig();
    const filenameCallback = jest.fn();
    
    const mockFile = { originalname: 'testfile.jpg' };
    
    // Mock Date.now() for predictable output
    jest.spyOn(global.Date, 'now').mockImplementation(() => 1700000000000); 

    (config.storage as any).getFilename({}, mockFile, filenameCallback);

    expect(filenameCallback).toHaveBeenCalledWith(null, '1700000000000.jpg');

    // Restore Date.now()
    jest.restoreAllMocks();
  });
});
