/** 文件流下载响应（axios responseType: 'blob' + fullRes） */
export type StreamDownloadResponse = {
  data: Blob
  headers: Record<string, any>
}

/** 从 Content-Disposition 解析文件名（兼容 filename / filename*=UTF-8''） */
export const parseContentDispositionFilename = (disposition?: string): string => {
  if (!disposition) return ''
  const utf8Match = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(disposition)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].trim().replace(/["']/g, ''))
  }
  const plainMatch = /filename=([^;]+)/i.exec(disposition)
  if (plainMatch?.[1]) {
    return decodeURIComponent(plainMatch[1].trim().replace(/["']/g, ''))
  }
  return ''
}

/** 下载文件：后台返回的文件流 */
export const downloadFileFromStream = (
  stream: BlobPart,
  fileName = '',
  className?: string,
) => {
  const blob = stream instanceof Blob ? stream : new Blob([stream])
  if ((window.navigator as any).msSaveOrOpenBlob) {
    ;(navigator as any).msSaveBlob(blob, fileName)
    return
  }
  const elink = document.createElement('a')
  if (className) {
    elink.className = className
  }
  elink.download = fileName
  elink.style.display = 'none'
  elink.href = URL.createObjectURL(blob)
  document.body.appendChild(elink)
  elink.click()
  document.body.removeChild(elink)
  URL.revokeObjectURL(elink.href)
}

/**
 * 带异常处理的文件流下载（blob 可能是业务错误 JSON）
 * @returns 实际下载使用的文件名
 */
export const handleExceptDown = (
  streamRes: StreamDownloadResponse,
  fileName?: string,
  className?: string,
): Promise<string> => {
  const { data, headers } = streamRes
  const resFileName = parseContentDispositionFilename(headers?.['content-disposition'])
  const newFileName = fileName || resFileName || 'download'

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const jsonData = JSON.parse(String(e.target?.result ?? ''))
        // 能解析成 JSON 说明是业务错误体，不是真实文件流
        reject(new Error(jsonData.errMessage || jsonData.message || '下载失败'))
      } catch {
        downloadFileFromStream(data, newFileName, className)
        resolve(newFileName)
      }
    }
    fileReader.onerror = () => reject(new Error('读取下载内容失败'))
    fileReader.readAsText(data)
  })
}
