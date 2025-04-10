import { renderTemplate, showElement, hideElement } from './views.js';

let studentName = '';
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let startTime = null;
let quizInterval = null;

// === DOM References ===
const appContainer = document.getElementById('app');
const quizApiBase = 'https://my-json-server.typicode.com/FarheenMahmud/CUS_1172_PROJECT_3_QUIZ/quizzes'; // <-- Replace this
const specificQuizEndpoint = `${quizApiBase}/quizzes`; 

// === Startup ===
document.addEventListener('DOMContentLoaded', () => {
  renderStartScreen();
});

function renderStartScreen() {
  renderTemplate('start', {}, appContainer);

  const form = document.getElementById('start-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    studentName = form.name.value.trim();
    const selectedQuiz = form.quiz.value;

    if (studentName && selectedQuiz) {
      loadQuiz(selectedQuiz);
    }
  });
}

// === Load Quiz JSON from API ===
async function loadQuiz(quizId) {
  try {
    const res = await fetch(`${quizApiBase}/${quizId}`);
    if (!res.ok) throw new Error('Failed to load quiz');
    currentQuiz = await res.json();
    totalQuestions = currentQuiz.questions.length;
    currentQuestionIndex = 0;
    score = 0;
    startTime = Date.now();

    startTimer();
    renderCurrentQuestion();
  } catch (error) {
    console.error('Error loading quiz:', error);
    renderTemplate('error', { message: 'Failed to load quiz.' }, appContainer);
  }
}

// === Timer Logic ===
function startTimer() {
  const timerElement = document.getElementById('timer');
  quizInterval = setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    if (timerElement) timerElement.textContent = `Time: ${seconds}s`;
  }, 1000);
}

// === Render One Question ===
function renderCurrentQuestion() {
  if (currentQuestionIndex >= totalQuestions) {
    endQuiz();
    return;
  }

  const question = currentQuiz.questions[currentQuestionIndex];
  const questionData = {
    questionNumber: currentQuestionIndex + 1,
    totalQuestions,
    question,
    studentName
  };

  renderTemplate(`question-${question.type}`, questionData, appContainer);

  // Handle answer submission
  const form = document.getElementById('question-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const userAnswer = getAnswerFromForm(form, question);
    const isCorrect = checkAnswer(userAnswer, question);

    if (isCorrect) {
      score++;
      renderFeedback('correct');
    } else {
      renderFeedback('wrong', question);
    }
  });

  updateScoreboard();
}

function getAnswerFromForm(form, question) {
  switch (question.type) {
    case 'mc':
    case 'image':
      return form.querySelector('input[name="answer"]:checked')?.value;
    case 'text':
      return form.answer.value.trim();
    default:
      return '';
  }
}

function checkAnswer(userAnswer, question) {
  return userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
}

// === Feedback ===
function renderFeedback(type, question = null) {
  if (type === 'correct') {
    renderTemplate('feedback-correct', {}, appContainer);
    setTimeout(() => {
      currentQuestionIndex++;
      renderCurrentQuestion();
    }, 1000);
  } else {
    renderTemplate('feedback-wrong', {
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    }, appContainer);

    document.getElementById('got-it-btn').addEventListener('click', () => {
      currentQuestionIndex++;
      renderCurrentQuestion();
    });
  }
}

// === Scoreboard ===
function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  if (!scoreboard) return;

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  scoreboard.innerHTML = `
    <p>Question: ${currentQuestionIndex + 1} / ${totalQuestions}</p>
    <p>Score: ${score}</p>
    <p id="timer">Time: ${elapsed}s</p>
  `;
}

// === End of Quiz ===
function endQuiz() {
  clearInterval(quizInterval);
  const passed = (score / totalQuestions) >= 0.8;
  renderTemplate('end', {
    studentName,
    score,
    totalQuestions,
    passed
  }, appContainer);

  document.getElementById('restart-btn').addEventListener('click', () => {
    renderStartScreen();
  });
}
