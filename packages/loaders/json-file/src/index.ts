import { Source, parseGraphQLJSON, SchemaPointerSingle, DocumentLoader, isValidPath, SingleFileOptions } from '@graphql-toolkit/common';

const FILE_EXTENSIONS = ['.json'];

export interface JsonFileLoaderOptions extends SingleFileOptions {
  fs?: typeof import('fs');
  path?: typeof import('path');
}

export class JsonFileLoader implements DocumentLoader {
  loaderId(): string {
    return 'json-file';
  }

  async canLoad(pointer: SchemaPointerSingle, options: JsonFileLoaderOptions): Promise<boolean> {
    if (isValidPath(pointer) && options.path && options.fs) {
      const { resolve, isAbsolute } = options.path;
      if (FILE_EXTENSIONS.find(extension => pointer.endsWith(extension))) {
        const normalizedFilePath = isAbsolute(pointer) ? pointer : resolve(options.cwd || process.cwd(), pointer);
        const { exists } = options.fs;
        if (await new Promise(resolve => exists(normalizedFilePath, resolve))) {
          return true;
        }
      }
    }

    return false;
  }

  async load(pointer: SchemaPointerSingle, options: JsonFileLoaderOptions): Promise<Source> {
    if (options.path) {
    }
    const { resolve: resolvePath, isAbsolute } = options.path;
    const normalizedFilepath = isAbsolute(pointer) ? pointer : resolvePath(options.cwd || process.cwd(), pointer);

    try {
      const { readFileSync } = options.fs;
      const jsonContent = readFileSync(normalizedFilepath, 'utf8');
      return parseGraphQLJSON(pointer, jsonContent, options);
    } catch (e) {
      throw new Error(`Unable to read JSON file: ${normalizedFilepath}: ${e.message || e}`);
    }
  }
}
