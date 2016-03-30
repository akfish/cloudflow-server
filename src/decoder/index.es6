import Promise from 'bluebird'

export { default as GIF } from './gif'

export function decodeWith (decoder) {
  return decoder.decode
}

export function decodeAllWith (decoder) {
  return (images) => Promise.map(images, decoder.decode)
}
