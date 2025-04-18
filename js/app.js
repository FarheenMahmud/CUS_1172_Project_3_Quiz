// app.js

import { Views } from './views.js';

let studentName = '';
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let startTime = null;
let quizInterval = null;

function handleStartQuizSubmit(selectedQuizId) {
  loadQuiz(selectedQuizId);
}

// === DOM References ===
const appContainer = document.getElementById('app');
const quizApiBase = 'https://my-json-server.typicode.com/FarheenMahmud/CUS_1172_PROJECT_3_QUIZ';
const quizzesEndpoint = `${quizApiBase}/quizzes`;

// === Startup ===
document.addEventListener('DOMContentLoaded', () => {
  renderStartScreen();
});

async function renderStartScreen() {
  await Views.showStart(appContainer, { studentName: studentName });
}

function handleStartQuiz(e) {
  console.log('handleStartQuiz called');
  e.preventDefault();

  const form = e.currentTarget;

  // Directly query the elements based on the form's ID
  const nameInput = document.querySelector('#start-form input[name="name"]');
  const quizSelect = document.querySelector('#start-form select[name="quiz"]');

  console.log('nameInput (direct query in handler):', nameInput);
  console.log('quizSelect (direct query in handler):', quizSelect);

  if (nameInput && quizSelect) {
    studentName = nameInput.value.trim();
    const selectedQuizId = quizSelect.value;

    if (studentName && selectedQuizId) {
      loadQuiz(selectedQuizId);
    }
  } else {
    console.error("Name or quiz input elements NOT FOUND via direct query in handler.");
  }
}

// === Load Quiz JSON from API ===
async function loadQuiz(quizId) {
  console.log('loadQuiz called with ID:', quizId);
  try {
    const res = await fetch(quizzesEndpoint);
    console.log('API Response Status:', res.status);
    if (!res.ok) {
      throw new Error(`Failed to fetch quizzes: ${res.status}`);
    }
    const data = await res.json();
    console.log('API Response Data:', data);
    currentQuiz = data.find(quiz => quiz.id.toString() === quizId);
    console.log('Found currentQuiz:', currentQuiz);

    if (!currentQuiz) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }

    // Only proceed if currentQuiz has a value
    if (currentQuiz) {
      totalQuestions = currentQuiz.questions.length;
      currentQuestionIndex = 0;
      score = 0;
      startTime = Date.now();

      startTimer();
      await renderCurrentQuestion(); // Keep the await
    } else {
      console.error(`Error: Could not load quiz with ID: ${quizId}`);
      // Optionally display an error message to the user
    }

  } catch (error) {
    console.error('Error loading quiz:', error);
    // Optionally display an error message to the user
  }
}

// === Timer Logic ===
function startTimer() {
  const timerElement = document.getElementById('timer');
  quizInterval = setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    if (timerElement) {
      timerElement.textContent = `Time: ${seconds}s`;
    }
  }, 1000);
}

// === Render One Question ===
async function renderCurrentQuestion() {
  if (currentQuestionIndex >= totalQuestions) {
    endQuiz();
    return;
  }

  const question = currentQuiz.questions[currentQuestionIndex];
  const questionData = {
    questionNumber: currentQuestionIndex + 1,
    totalQuestions,
    question,
    studentName,
  };

  await Views.showQuestion(appContainer, questionData);

  const qType = question.type;

  if (qType === 'multiple-choice') {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const userAnswer = btn.getAttribute('data-answer');
        handleAnswer(userAnswer);
      });
    });
  } else if (qType === 'image-choice') {
    const images = document.querySelectorAll('.img-choice');
    images.forEach(img => {
      img.addEventListener('click', () => {
        const userAnswer = img.getAttribute('data-answer');
        handleAnswer(userAnswer);
      });
    });
  } else if (qType === 'narrative') {
    const submitBtn = document.querySelector('.submit-narrative');
    const input = document.querySelector('#narrative-answer');
    if (submitBtn && input) {
      submitBtn.addEventListener('click', () => {
        const userAnswer = input.value.trim();
        handleAnswer(userAnswer);
      });
    }
  }
}

function handleAnswer(userAnswer) {
  const question = currentQuiz.questions[currentQuestionIndex];
  const isCorrect = checkAnswer(userAnswer, question);

  if (isCorrect) {
    score++;
    renderFeedback('correct');
  } else {
    renderFeedback('wrong', question);
  }
}

function handleAnswerSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const question = currentQuiz.questions[currentQuestionIndex];
  const userAnswer = getAnswerFromForm(form, question);
  const isCorrect = checkAnswer(userAnswer, question);

  if (isCorrect) {
    score++;
    renderFeedback('correct');
  } else {
    renderFeedback('wrong', question);
  }
}

function getAnswerFromForm(form, question) {
  switch (question.type) {
    case 'multiple-choice':
    case 'image-choice':
      return form.querySelector('input[name="answer"]:checked')?.value;
    case 'narrative':
      return form.answer.value.trim();
    default:
      return '';
  }
}

function checkAnswer(userAnswer, question) {
  return userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
}

// === Feedback ===
async function renderFeedback(type, question = null) {
  if (type === 'correct') {
    await Views.showCorrect(appContainer); // Use await
    currentQuestionIndex++;
    setTimeout(() => {
      renderCurrentQuestion();
    }, 1000);
  } else {
    Views.showWrong(appContainer, {
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });

    const gotItBtn = document.querySelector('.got-it-btn');

    if (gotItBtn) {
      gotItBtn.addEventListener('click', () => {
        console.log('Got It button clicked'); // ADDED CONSOLE LOG
        currentQuestionIndex++;
        renderCurrentQuestion();
      });
    }
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

// *** ADD THE FUNCTION DEFINITION HERE ***
function incrementQuestionAndRender() {
  currentQuestionIndex++;
  renderCurrentQuestion();
}

// === End of Quiz ===
async function endQuiz() { // Make endQuiz async
  clearInterval(quizInterval);
  const passed = (score / totalQuestions) >= 0.8;
  await Views.showResult(appContainer, { // Await the rendering of the results
    studentName,
    score,
    totalQuestions,
    passed,
  });

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      console.log('Retake Quiz button clicked');
      renderStartScreen();
    });
  }
}

// *** UPDATE THE EXPORT STATEMENT HERE ***
export { handleStartQuizSubmit, renderStartScreen, incrementQuestionAndRender };