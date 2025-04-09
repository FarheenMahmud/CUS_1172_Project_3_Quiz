// app.js

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
const quizApiBase = 'https://my-json-server.typicode.com/YOUR_USERNAME/YOUR_REPO/quizzes'; // <-- Replace this

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
    start
