/**
 * Fetch with Timeout
 * Prevents hanging requests from blocking the RAG pipeline.
 */
export async function fetchWithTimeout(
  url: string,
  options: any,
  timeout = 8000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
