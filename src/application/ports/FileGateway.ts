export interface FileGateway {
  read(path: string): Promise<string>;
  write(path: string, contents: string): Promise<void>;
}
