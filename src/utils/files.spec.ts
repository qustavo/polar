import * as fs from 'fs';
import { join } from 'path';
import { dataPath } from './config';
import { dataFileExists, readDataFile, writeDataFile } from './files';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(() => Buffer.from('test data')),
    access: jest.fn(),
  },
}));

const mockFs = fs.promises as jest.Mocked<typeof fs.promises>;

describe('Files util', () => {
  describe('read files', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(Buffer.from('test data'));
    });

    it('should read files from disk in the app data dir', async () => {
      await readDataFile('networks/test.txt');
      expect(mockFs.readFile).toBeCalledTimes(1);
    });

    it('should handle relative paths', async () => {
      const relPath = join('networks', 'test.txt');
      const absPath = join(dataPath, relPath);
      await readDataFile(relPath);
      expect(mockFs.readFile).toBeCalledTimes(1);
      expect(mockFs.readFile).toBeCalledWith(absPath);
    });

    it('should handle absolute paths', async () => {
      const absPath = join(__dirname, 'networks', 'test.txt');
      await readDataFile(absPath);
      expect(mockFs.readFile).toBeCalledTimes(1);
      expect(mockFs.readFile).toBeCalledWith(absPath);
    });
  });

  describe('write files', () => {
    it('should write files to disk in the app data dir', async () => {
      await writeDataFile('networks/test.txt', 'test data');
      expect(mockFs.mkdir).toBeCalledTimes(1);
      expect(mockFs.writeFile).toBeCalledTimes(1);
    });

    it('should handle relative paths', async () => {
      const relPath = join('networks', 'test.txt');
      const absPath = join(dataPath, relPath);
      const data = 'test data';
      await writeDataFile(relPath, data);
      expect(mockFs.mkdir).toBeCalledTimes(1);
      expect(mockFs.writeFile).toBeCalledTimes(1);
      expect(mockFs.writeFile).toBeCalledWith(absPath, data);
    });

    it('should handle absolute paths', async () => {
      const absPath = join(__dirname, 'networks', 'test.txt');
      const data = 'test data';
      await writeDataFile(absPath, data);
      expect(mockFs.mkdir).toBeCalledTimes(1);
      expect(mockFs.writeFile).toBeCalledTimes(1);
      expect(mockFs.writeFile).toBeCalledWith(absPath, data);
    });
  });

  describe('file exists', () => {
    it('should return true if the file exists', async () => {
      mockFs.access.mockResolvedValue();
      const exists = await dataFileExists(join('networks', 'test.txt'));
      expect(exists).toBe(true);
    });

    it('should return false if the file does not exist', async () => {
      mockFs.access.mockRejectedValue(new Error('file not found'));
      const exists = await dataFileExists(join('networks', 'test.txt'));
      expect(exists).toBe(false);
    });

    it('should handle relative paths', async () => {
      mockFs.access.mockResolvedValue();
      const relPath = join('networks', 'test.txt');
      const absPath = join(dataPath, relPath);
      const exists = await dataFileExists(relPath);
      expect(exists).toBe(true);
      expect(mockFs.access).toBeCalledWith(absPath);
    });

    it('should handle absolute paths', async () => {
      mockFs.access.mockResolvedValue();
      const absPath = join(__dirname, 'networks', 'test.txt');
      const exists = await dataFileExists(absPath);
      expect(exists).toBe(true);
      expect(mockFs.access).toBeCalledWith(absPath);
    });
  });
});
