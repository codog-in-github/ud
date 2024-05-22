import fs from 'fs';
/**
 * 创建一个等待消息的函数，根据传入的消息和选项执行相应的回调。
 * @param {(msg:string) => boolean} msgChecker - 消息的回调函数，返回true表示消息已处理，返回false表示消息未处理。
 * @param {Object} options - 配置选项，包含：
 *   - onOther: 当接收到的消息不匹配时调用的函数，默认为空函数。
 *   - onSuccess: 当接收到的消息匹配时调用的函数，默认为空函数。
 *   - onTimeout: 当等待超时时调用的函数，默认为空函数。
 *   - timeout: 等待消息的超时时间（毫秒），-1表示不超时，默认为-1。
 * @returns {(data: string|Buffer) => void} 接收数据并根据情况执行回调的函数。
 */
export function waitMsg (msgChecker, options = {}) {
  const {
    onOther = () => {},
    onSuccess = () => {},
    onTimeout = () => {},
    timeout = -1
  } = options
  let resetTimer = () => {}
  if(timeout > 0) {
    let timmer
    resetTimer = function (stop) {
      clearTimeout(timmer)
      if(stop) {
        resetTimer = () => {}
      } else {
        timmer = setTimeout(() => {
          onTimeout()
        }, timeout)
      }
    }
  }
  return (data) => {
    const pass = msgChecker(data)
    resetTimer(pass)
    if(pass) {
      onSuccess()
    } else {
      onOther(data)
    }
  }
}
/**
 * @param {(buffer: Buffer) => void} write 
 * @returns {(buffer: Buffer) => void}
 */
export function createFileStreamTransfer (write) {
  return function onData (data) {
    write(data)
  }
}

export function readFileStream (filePath, {
  onData, onEnd, onError = () => {}, onFinally = () => {}
}) {
  if(!fs.existsSync(filePath)) {
    onError(new Error('file not found'))
    return
  }
  const io = fs.createReadStream(filePath)
  io.on('data', onData)
  io.on('end', () => {
    onEnd()
    onFinally()
  })
  io.on('error', (err) => {
    onError(err)
    onFinally()
  })
}

export function writeFileStream (filePath, options = {}) {
  const { onEnd, onError = () => {}, onFinally = () => {} } = options
  if(fs.existsSync(filePath)) {
    onError(new Error('file exists'))
  }
  const io = fs.createWriteStream(filePath)
  io.on('end', () => {
    onEnd()
    onFinally()
  })
  io.on('error', (err) => {
    onError(err)
    onFinally()
  })
  return {
    write: data => {
      io.write(data)
    },
    end: () => {
      io.end()
      io.destroy()
    }
  }
}