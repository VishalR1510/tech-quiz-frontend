const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const getQuizzes = async () => {
  const res = await fetch(`${API_URL}/quizzes/default`);
  return res.json();
};

export const getQuiz = async (id) => {
  const res = await fetch(`${API_URL}/quiz/${id}`);
  return res.json();
};

export const getQuizByCode = async (code) => {
  const res = await fetch(`${API_URL}/quiz/code/${code}`);
  return res.json();
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
  return res.json();
};

export const getResults = async (quizId, userId) => {
  const res = await fetch(`${API_URL}/quiz/${quizId}/results?user_id=${userId}`);
  return res.json();
};
