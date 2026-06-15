let API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const REQUEST_TIMEOUT_MS = 60000
const RETRYABLE_STATUSES = new Set([502, 503, 504])

// Auto-append /api if it's missing from the base URL
if (API_URL && !API_URL.endsWith('/api')) {
  console.warn("VITE_API_URL is missing the '/api' suffix. Automatically appending it...");
  API_URL = `${API_URL}/api`;
}

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.error("VITE_API_URL is NOT defined in production! Requests will fail or point to localhost.");
} else {
  console.log(`[API] Using base URL: ${API_URL}`);
}

const getErrorMessage = (body, fallback) => {
  if (typeof body?.detail === 'string') return body.detail
  if (Array.isArray(body?.detail)) {
    return body.detail.map((item) => item.msg || JSON.stringify(item)).join(', ')
  }
  if (typeof body?.message === 'string') return body.message
  return fallback
}

const apiRequest = async (path, options = {}) => {
  const method = options.method || 'GET'
  const maxAttempts = method === 'GET' ? 2 : 1

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        signal: controller.signal,
      })
      const body = await res.json().catch(() => null)

      if (res.ok) return body

      if (attempt < maxAttempts && RETRYABLE_STATUSES.has(res.status)) {
        await new Promise((resolve) => setTimeout(resolve, 750))
        continue
      }

      const error = new Error(getErrorMessage(body, `Request failed with status ${res.status}`))
      error.status = res.status
      throw error
    } catch (error) {
      const isAbort = error.name === 'AbortError'
      const isNetworkError = error instanceof TypeError

      if (attempt < maxAttempts && (isAbort || isNetworkError)) {
        await new Promise((resolve) => setTimeout(resolve, 750))
        continue
      }

      if (isAbort) {
        throw new Error('The server took too long to respond. Please try again.')
      }

      if (isNetworkError) {
        throw new Error('Unable to reach the server. Check your connection and try again.')
      }

      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export const resolveLoginEmail = async (identifier) => {
  const normalizedIdentifier = identifier.trim();

  if (normalizedIdentifier.includes('@')) {
    return normalizedIdentifier.toLowerCase();
  }

  const data = await apiRequest('/auth/resolve-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: normalizedIdentifier }),
  });
  return data.email;
};

export const getQuizzes = async () => {
  const result = await apiRequest('/quizzes/default')
  if (!Array.isArray(result?.data)) throw new Error('Invalid quiz list received from the server')
  return result
};

export const getUserQuizzes = async (userId) => {
  if (!userId) {
    throw new Error('Missing userId parameter');
  }
  const result = await apiRequest(`/quizzes/my-quizzes/${encodeURIComponent(userId)}`)
  if (!Array.isArray(result?.data)) throw new Error('Invalid personal quiz list received from the server')
  return result
};

export const getQuiz = async (id) => {
  if (!id?.trim()) throw new Error('Missing quiz ID or code')
  const data = await apiRequest(`/quiz/${encodeURIComponent(id.trim())}`)
  if (!data.quiz || !data.questions) {
    throw new Error('Invalid quiz data received');
  }
  return data;
};

export const getQuizByCode = async (code) => {
  if (!code?.trim()) throw new Error('Quiz code is required')
  const data = await apiRequest(`/quiz/code/${encodeURIComponent(code.trim().toUpperCase())}`)
  if (!data.quiz_id) {
    throw new Error('Invalid response: missing quiz_id');
  }
  return data;
};

export const createQuiz = async (data) => {
  const result = await apiRequest('/quiz/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!result?.quiz_id || !result?.quiz_code) throw new Error('Invalid quiz creation response')
  return result
};

export const submitQuiz = async (quizId, data) => {
  if (!quizId) throw new Error('Missing quiz ID')
  const result = await apiRequest(`/quiz/${encodeURIComponent(quizId)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (typeof result.score !== 'number' || typeof result.total !== 'number') {
    throw new Error('Invalid response: missing score or total');
  }
  return result;
};

export const getResults = async (quizId, userId) => {
  if (!quizId || !userId) {
    throw new Error('Missing required parameters: quizId and userId');
  }
  const query = new URLSearchParams({ user_id: userId })
  const result = await apiRequest(`/quiz/${encodeURIComponent(quizId)}/results?${query}`)
  if (typeof result.score !== 'number' || !result.answers) {
    throw new Error('Invalid response: missing score or answers');
  }
  return result;
};

export const deleteQuiz = async (quizId, userId) => {
  if (!quizId || !userId) {
    throw new Error('Missing required parameters: quizId and userId');
  }
  const query = new URLSearchParams({ user_id: userId })
  return apiRequest(`/quiz/${encodeURIComponent(quizId)}?${query}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
};
