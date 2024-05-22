import url from 'url'
import path from 'path'

const __dirname = path.dirname(
  url.fileURLToPath(
    import.meta.url
  )
)

export const APP_DIR = path.join(__dirname, '..')
export const STATIC_DIR = path.join(APP_DIR, 'static')

