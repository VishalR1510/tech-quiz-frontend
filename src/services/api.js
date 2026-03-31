let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Auto-append /api if it's missing from the base URL
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  console.warn("VITE_API_URL is missing the '/api' suffix. Automatically appending it...");
  API_URL = API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`;
}

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.error("VITE_API_URL is NOT defined in production! Requests will fail or point to localhost.");
} else {
  console.log(`[API] Using base URL: ${API_URL}`);
}

export const getQuizzes = async () => {
  const res = await fetch(`${API_URL}/quizzes/default`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch quizzes');
  }
  return res.json();
};

export const getUserQuizzes = async (userId) => {
  if (!userId) {
    throw new Error('Missing userId parameter');
  }
  const res = await fetch(`${API_URL}/quizzes/my-quizzes/${userId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch your quizzes');
  }
  return res.json();
};

export const getQuiz = async (id) => {
  // Try to fetch by quiz_id first
  const res = await fetch(`${API_URL}/quiz/${id}`);
  
  // If not found and ID looks like a quiz code, try the code endpoint
  if (res.status === 404 && id.length <= 8) {
    const codeRes = await fetch(`${API_URL}/quiz/code/${id}`);
    if (codeRes.ok) {
      const data = await codeRes.json();
      if (data.quiz_id) {
        // Recursively fetch the full quiz with the ID
        return getQuiz(data.quiz_id);
      }
    }
    throw new Error('Quiz not found');
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch quiz');
  }
  
  const data = await res.json();
  if (!data.quiz || !data.questions) {
    throw new Error('Invalid quiz data received');
  }
  return data;
};

export const getQuizByCode = async (code) => {
  const res = await fetch(`${API_URL}/quiz/code/${code}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Invalid quiz code');
  }
  const data = await res.json();
  if (!data.quiz_id) {
    throw new Error('Invalid response: missing quiz_id');
  }
  return data;
};

export const createQuiz = async (data) => {
  const res = await fetch(`${API_URL}/quiz/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  console.log('API Response:', { status: res.status, body: json });
  if (!res.ok) {
    throw new Error(json.detail || 'Failed to create quiz');
  }
  return json;
};

export const submitQuiz = async (quizId, data) => {
  const res = await fetch(`${API_URL}/quiz/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to submit quiz');
  }
  const result = await res.json();
  if (typeof result.score !== 'number' || typeof result.total !== 'number') {
    throw new Error('Invalid response: missing score or total');
  }
  return result;
};

export const getResults = async (quizId, userId) => {
  if (!quizId || !userId) {
    throw new Error('Missing required parameters: quizId and userId');
  }
  const res = await fetch(`${API_URL}/quiz/${quizId}/results?user_id=${userId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch results');
  }
  const result = await res.json();
  if (typeof result.score !== 'number' || !result.answers) {
    throw new Error('Invalid response: missing score or answers');
  }
  return result;
};

export const deleteQuiz = async (quizId, userId) => {
  if (!quizId || !userId) {
    throw new Error('Missing required parameters: quizId and userId');
  }
  const res = await fetch(`${API_URL}/quiz/${quizId}?user_id=${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to delete quiz');
  }
  return res.json();
};
