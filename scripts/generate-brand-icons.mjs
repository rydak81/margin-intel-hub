// Raster fallbacks rendered from the same vector mark used by SiteBrand.
// Run from the repository root: node scripts/generate-brand-icons.mjs
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'

const svg = await readFile('public/icon.svg')
for (const [name, size] of [
  ['brand-icon.png', 512], ['apple-icon.png', 180],
  ['icon-light-32x32.png', 32], ['icon-dark-32x32.png', 32],
  ['icon-192.png', 192],
]) {
  await sharp(svg).resize(size, size).png().toFile(`public/${name}`)
}
await sharp(svg).resize(64, 64).flatten({ background: '#ffffff' }).jpeg({ quality: 95 }).toFile('public/favicon.jpg')

// ICO permits PNG entries; include the common browser tab sizes.
const sizes = [16, 32, 48]
const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()))
const header = Buffer.alloc(6 + 16 * images.length)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
let offset = header.length
images.forEach((png, i) => {
  const entry = 6 + i * 16
  header[entry] = sizes[i]
  header[entry + 1] = sizes[i]
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(png.length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += png.length
})
await writeFile('public/favicon.ico', Buffer.concat([header, ...images]))
