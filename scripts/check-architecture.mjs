import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

class ArchitectureCheck {
  root = fileURLToPath(new URL('../src/', import.meta.url));
  errors = [];
  files = 0;
  imports = 0;

  async run(directory = this.root) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await this.run(path);
      else if (entry.name.endsWith('.ts')) await this.inspect(path);
    }
  }
  async inspect(path) {
    this.files++;
    const source = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, true);
    const location = relative(this.root, path).replaceAll('\\', '/');
    const layer = location.split('/')[0];
    const classes = source.statements.filter(ts.isClassDeclaration);
    if (classes.length > 1) this.errors.push(`${location}: multiple classes`);
    for (const declaration of classes) {
      if (declaration.name?.text !== basename(path, '.ts')) this.errors.push(`${location}: class/file name mismatch`);
    }
    const visit = node => {
      if (ts.isSwitchStatement(node)) this.errors.push(`${location}: switch dispatch is forbidden`);
      if (ts.isFunctionDeclaration(node) && node.parent === source) this.errors.push(`${location}: top-level procedural function`);
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        this.imports++;
        const specifier = node.moduleSpecifier.text;
        const destination = specifier.startsWith('.')
          ? relative(this.root, resolve(dirname(path), specifier)).replaceAll('\\', '/') : specifier;
        const targetLayer = destination.split('/')[0];
        if (layer === 'domain' && (!specifier.startsWith('.') || targetLayer !== 'domain')) {
          this.errors.push(`${location}: forbidden domain dependency ${specifier}`);
        }
        if (layer === 'application' && ['infrastructure', 'cli'].includes(targetLayer)) {
          this.errors.push(`${location}: forbidden application dependency ${specifier}`);
        }
        if (layer === 'infrastructure' && targetLayer === 'cli') this.errors.push(`${location}: forbidden infrastructure dependency ${specifier}`);
        if (layer === 'application' && /^(node:|@xmldom)/.test(specifier)) this.errors.push(`${location}: concrete IO dependency ${specifier}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
}

const check = new ArchitectureCheck();
await check.run();
if (check.errors.length) {
  console.error(check.errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Architecture OK: ${check.files} TypeScript files, ${check.imports} imports; layer boundaries, class/file names, no top-level functions or switch statements.`);
