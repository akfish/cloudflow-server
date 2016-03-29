export { default as GIF } from './gif'

export function encodeWith (encoder) {
  return (image) => {
    if (!image.encoders) image.encoders = []
    image.encoders.push(encoder)
    return image
  }
}
