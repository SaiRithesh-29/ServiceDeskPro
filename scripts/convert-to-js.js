/**
 * Convert TypeScript backend to JavaScript using TypeScript's own transpileModule API.
 * This properly strips all type annotations while preserving runtime code.
 */
const ts = require(require('path').resolve(__dirname, '..', 'backend', 'node_modules', 'typescript'));
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'backend', 'src');

const compilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  esModuleInterop: true,
  skipLibCheck: true,
  removeComments: false,
  jsx: ts.JsxEmit.Preserve,
};

function convertFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const result = ts.transpileModule(content, {
    compilerOptions,
    fileName: filePath,
  });
  
  // Fix import paths: .js stays as .js (already correct for ESM Node)
  let output = result.outputText;
  
  // Write back with .js extension
  const newPath = filePath.replace(/\.ts$/, '.js');
  fs.writeFileSync(newPath, output, 'utf-8');
  
  // Delete original .ts file
  if (newPath !== filePath) {
    fs.unlinkSync(filePath);
  }
  
  console.log(`✓ ${path.relative(SRC_DIR, filePath)} → ${path.basename(newPath)}`);
}

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      convertFile(fullPath);
    }
  }
}

console.log('=== Converting Backend: TypeScript → JavaScript ===\n');
processDir(SRC_DIR);
console.log('\n✓ All backend files converted to JavaScript!');
