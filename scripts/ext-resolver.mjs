// Node ESM loader that adds .js extensions for extensionless relative imports,
// matching Vite's behaviour. Used only for running our smoke tests.
import { existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !specifier.endsWith('.js') && !specifier.endsWith('.mjs') && !specifier.endsWith('.json')) {
    try {
      const parent = context.parentURL ? fileURLToPath(context.parentURL) : process.cwd();
      const parentDir = path.dirname(parent);
      const candidate = path.resolve(parentDir, specifier + '.js');
      if (existsSync(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    } catch (_) { /* ignore */ }
  }
  return nextResolve(specifier, context);
}
