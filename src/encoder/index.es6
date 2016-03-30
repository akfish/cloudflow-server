export { default as GIF } from './gif'

export function encodeWith (key, encoder) {
  return (image) => {
    if (!image.encoders) image.encoders = []
    image.encoders.push(encoder.encode.bind(encoder, key))
    return image
  }
}
