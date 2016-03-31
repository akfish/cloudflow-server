import url from 'url'
export const URL = {
  BASE: 'http://www.nmc.cn/',
  INDEX: 'http://www.nmc.cn/publish/radar/stations/index.html',
  IMAGE_BASE: 'http://image.nmc.cn/',
  resolve: (relative) => url.resolve(URL.BASE, relative),
  resolveImage: (relative) => url.resolve(URL.IMAGE_BASE, relative)
}
export const REGEX = {
  STATION: /<li><a href="(\/publish\/radar\/(?:stations-)?(\w+).html)">(.+)<\/a><\/li>/gm,
  IMAGE: /data.push\({dataId:'',img_path:'(.+)',html_path:'',ymd:'(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2})'}\)/gm
}

export const ROI = {
  '640x480': [1, 1, 477, 477],
  '672x512': [1, 1, 509, 509]
}

export const PALETTE = [
  0xd8d8d8,
  0x0000f6,
  0x01a0f6,
  0x00ecec,
  0x01ff00,
  0x00c800,
  0x019000,
  0xffff00,
  0xe7c000,
  0xff9000,
  0xff0000,
  0xd60000,
  0xc00000,
  0xff00f0,
  0x780084,
  0xad90f0,
  0x206060,
  0x000080,
  0x000000,
  0xFFFFFF,
  0xDEADED,
]

export const PALETTE_BUFFER = (() => {
  // let buf = new Buffer(256 * 3)
  let buf = new Buffer(Math.pow(2, Math.ceil(Math.log2(PALETTE.length))) * 3)
  PALETTE.forEach((v, i) => {
    buf.writeUInt8(v >> 16, i * 3)
    buf.writeUInt8((v & 0x00FF00) >> 8, i * 3 + 1)
    buf.writeUInt8(v & 0x0000FF, i * 3 + 2)
  })
  return buf
})()
