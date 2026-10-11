import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'
registerHooks({ resolve(specifier, context, nextResolve) {
  const mapped = specifier.startsWith('@/') ? pathToFileURL(`${process.cwd()}/${specifier.slice(2)}.ts`).href : specifier
  return nextResolve(mapped, context)
} })
