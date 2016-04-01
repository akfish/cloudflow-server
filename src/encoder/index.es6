export { default as GIF } from './gif'
export { default as LZW } from './lzw'

export function encodeWith (key, encoder) {
  return (image) => {
    if (!image.encoders) image.encoders = []
    image.encoders.push(encoder.encode.bind(encoder, key))
    return image
  }
}

export function encodeAllWith (key, encoder) {
  return (images) => {
    let _encodeWith = encodeWith(key, encoder)
    images.forEach((image) => _encodeWith(image))
  }
}
