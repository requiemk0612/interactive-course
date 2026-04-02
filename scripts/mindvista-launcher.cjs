const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const HOST = '127.0.0.1'
const DEFAULT_PORT = 3986

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
}

function ensureDistExists() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('MindVista launcher could not find the dist folder. Run "npm run build" first.')
    process.exit(1)
  }
}

function safeResolve(requestPath) {
  const cleanPath = decodeURIComponent(requestPath.split('?')[0]).replace(/^\/+/, '')
  const targetPath = path.resolve(DIST_DIR, cleanPath || 'index.html')

  if (!targetPath.startsWith(path.resolve(DIST_DIR))) {
    return null
  }

  return targetPath
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
    }).unref()
    return
  }

  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref()
    return
  }

  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
}

function serveFile(filePath, response) {
  const extension = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[extension] || 'application/octet-stream'

  fs.readFile(filePath, (error, fileBuffer) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('MindVista launcher could not read a required file.')
      return
    }

    response.writeHead(200, { 'Content-Type': contentType })
    response.end(fileBuffer)
  })
}

ensureDistExists()

const server = http.createServer((request, response) => {
  if (!request.url) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Bad request')
    return
  }

  if (request.url === '/__health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ ok: true }))
    return
  }

  const candidate = safeResolve(request.url)
  if (!candidate) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Forbidden')
    return
  }

  fs.stat(candidate, (error, stats) => {
    if (!error && stats.isFile()) {
      serveFile(candidate, response)
      return
    }

    serveFile(path.join(DIST_DIR, 'index.html'), response)
  })
})

function handleServerReady() {
  const address = server.address()
  if (!address || typeof address === 'string') {
    console.error('MindVista launcher could not start the local server.')
    process.exit(1)
  }

  const url = `http://${HOST}:${address.port}`
  console.log('MindVista local server is running.')
  console.log(`Open in browser: ${url}`)
  console.log('Close this window to stop the local server.')
  openBrowser(url)
}

function checkExistingMindVista(port) {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: HOST,
        port,
        path: '/__health',
        timeout: 1200,
      },
      (response) => {
        let body = ''
        response.on('data', (chunk) => {
          body += chunk
        })
        response.on('end', () => {
          resolve(response.statusCode === 200 && body.includes('"ok":true'))
        })
      },
    )

    request.on('error', () => resolve(false))
    request.on('timeout', () => {
      request.destroy()
      resolve(false)
    })
  })
}

server.on('error', async (error) => {
  if (error && error.code === 'EADDRINUSE') {
    const alreadyRunning = await checkExistingMindVista(DEFAULT_PORT)

    if (alreadyRunning) {
      const url = `http://${HOST}:${DEFAULT_PORT}`
      console.log('MindVista is already running.')
      console.log(`Open in browser: ${url}`)
      openBrowser(url)
      process.exit(0)
    }

    server.listen(0, HOST, handleServerReady)
    return
  }

  console.error('MindVista launcher failed to start.', error)
  process.exit(1)
})

server.listen(DEFAULT_PORT, HOST, handleServerReady)

process.on('SIGINT', () => {
  server.close(() => process.exit(0))
})

process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})
