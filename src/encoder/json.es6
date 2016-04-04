import path from 'path'
import Logger from '../logger'
const log = Logger.get()

export default class Json {
  static encode (key, storage, image) {
    let frame = image[key]
    let { dir, name } = image.file
    let output = path.join(dir, `${name}-${key}.json`)

    return new Promise((resolve, reject) => {
      log.encode('begin.json', `${image}:${key}`)
      if (!frame) {
        log.encode('skip.json', `${image}:${key}`)
        return resolve()
      }
      let { width, height, contours } = frame
      return storage.writeFile(output, JSON.stringify({ width, height, contours }))
        .tap(() => log.encode('end.json', `${image}:${key}`))
    })
  }
}
