import * as costants from './costants.mjs';
import net from 'net'
import path from 'path';
import fs from 'fs';
import readLiner from 'readline'
import { writeFileStream } from './func.mjs';
import { constants } from 'buffer';

let wFile = null;
let cmdLock = false;
const cmdIo = readLiner.createInterface({
  input: process.stdin,
  output: process.stdout
})
cmdIo.on('line', (cmd) => {
  if (cmdLock) {
    return
  }
  if(/[Dd]\s+[A-Za-z0-9]+\.(:?jpg|rar|txt|xlsx|xls|doc|ppt)/.test(cmd)) {
    // 下载文件
    const [, fileName] = /[Dd]\s+([A-Za-z0-9]+\.(:?jpg|rar|txt|xlsx|xls|doc|ppt))/.exec(cmd)
    const filePath = path.resolve(costants.STATIC_DIR, fileName)
    wFile = writeFileStream(path.resolve(costants.APP_DIR, 'usr', filePath))
    socket.write(`D ${fileName}`)
  }
})

const socket = net.createConnection({
  host: 'localhost',
  port: 3000
})
socket.on('connect', () => {
})
socket.on('data', (data) => {
  console.log('ondata', data, data.toString())
  if(!wFile) {
    return
  }
  if(Buffer.compare(data.slice(data.bufferLength - 4), Buffer.alloc(4, 'EOF')) === 0) {
    wFile.write(data.slice(0, data.bufferLength - 4))
    wFile.end()
    wFile = null
    console.log('download complete')
  } else {
    console.log('downloading')
    wFile.write(data)
  }
})

socket.on('end', () => {
  process.exit(0)
})

socket.on('error', (err) => {
  process.exit(1)
})