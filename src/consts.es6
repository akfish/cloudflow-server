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
