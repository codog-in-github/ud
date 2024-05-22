import * as costants from './costants.mjs';
import net from 'net'
import path from 'path';
import fs from 'fs';
import { createFileStreamTransfer, readFileStream } from './func.mjs';

function cmdPraser(cmd, options = {}) {
  const {
    updateOnData = () => {},
    onFinally = () => {},
    onError = () => {},
    write = () => {}
  } = options
  if(cmd === 'q') {
    onError(new Error('exit'))
    return
  } else if(/D [A-Za-z0-9]+\.(:?jpg|rar|txt|xlsx|xls|doc|ppt)/.test(cmd)) {
    // 下载文件
    const [, fileName] = /D ([A-Za-z0-9]+\.(:?jpg|rar|txt|xlsx|xls|doc|ppt))/.exec(cmd)
    const filePath = path.resolve(costants.STATIC_DIR, fileName)
    console.log('[cmd] download file: ', filePath)
    updateOnData(() => {})
    readFileStream(
      filePath,
      {
        onData: createFileStreamTransfer(write),
        onFinally,
        onError,
        onEnd: () => {
          write(Buffer.alloc(4, 'EOF'))
        }
      }
    )
    return
  }
}

const server = net.createServer((socket) => {
  function disconnect () {
    socket.end()
  }
  let onData
  const readCmd = (data) => {
    cmdPraser(data.toString().trim(), {
      updateOnData: newOnDataFunc => { onData = newOnDataFunc },
      onFinally: () => { onData = readCmd },
      onError: (err) => disconnect(err.msg),
      write: data => socket.write(data)
    })
  }
  onData = readCmd
  socket.on('error', disconnect)
  socket.on('end', disconnect)
  socket.on('data', data => {
    onData(data)
   })
})

server.on('error', (err) => {
  console.log(err)
  process.exit(1)
})

server.listen(3000, () => {
  console.log('server listening on port 3000')
})
