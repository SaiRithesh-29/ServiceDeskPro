/**
 * Convert Frontend TypeScript/TSX to JavaScript/JSX using TypeScript's transpileModule API.
 */
const ts = require(require('path').resolve(__dirname, '..', 'frontend', 'node_modules', 'typescript'));
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'frontend', 'src');

const compilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
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
  
  let output = result.outputText;
  
  // Determine new extension
  const isTsx = filePath.endsWith('.tsx');
  const newExt = isTsx ? '.jsx' : '.js';
  const newPath = filePath.replace(/\.tsx?$/, newExt);
  
  fs.writeFileSync(newPath, output, 'utf-8');
  
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
    } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
      convertFile(fullPath);
    }
  }
}

console.log('=== Converting Frontend: TypeScript/TSX → JavaScript/JSX ===\n');
processDir(SRC_DIR);
console.log('\n✓ All frontend files converted!');
