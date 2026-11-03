import { readFile, writeFile } from 'node:fs/promises'
import { buildResearchBrief } from '../lib/research-desk.ts'

const [inputPath, outputPath] = process.argv.slice(2)
if (!inputPath || process.argv.length > 4) {
  throw new Error('Usage: node --import ./tests/register-ts.mjs scripts/research-desk.mjs INPUT.json [OUTPUT.json]')
}
const input = JSON.parse(await readFile(inputPath, 'utf8'))
const text = JSON.stringify(buildResearchBrief(input), null, 2) + '\n'
if (outputPath) await writeFile(outputPath, text, { flag: 'wx' })
else process.stdout.write(text)
