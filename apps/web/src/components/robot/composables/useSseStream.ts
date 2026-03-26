import type { SSEEvent } from './types';

/**
 * SSE 流式解析 Hook
 * 纯粹处理流式数据解析，不涉及业务逻辑
 */
export function useSseStream() {
  /**
   * 解析 SSE 流数据
   */
  const parseStream = async function* (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ): AsyncGenerator<SSEEvent, void, unknown> {
    const decoder = new TextDecoder();
    let chunk = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunk += decoder.decode(value, { stream: true });
      const lines = chunk.split('\n\n');
      chunk = lines.pop() || ''; // 最后一段可能是不完整的，留到下次

      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data: ')) continue;

        const data = line.slice(6); // 去掉 'data: ' 前缀
        if (data === '[DONE]') continue;

        try {
          const parsed: SSEEvent = JSON.parse(data);
          yield parsed;
        } catch (e) {
          console.error('解析 SSE 数据失败:', e, '原始数据:', data);
        }
      }
    }
  };

  /**
   * 创建流式请求
   */
  const createStreamRequest = async (
    url: string,
    options: RequestInit
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return response.body.getReader();
  };

  return {
    parseStream,
    createStreamRequest,
  };
}

