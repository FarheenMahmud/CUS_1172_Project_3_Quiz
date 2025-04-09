import { loadHomeView, loadQuizView, handleAnswer } from './views.js';

let currentQuiz = null;
let studentName = '';
let currentQuestionIndex = 0;
let score = 0;
let startTime = null;

document.addEventListener("DOMContentLoaded", () => {
  loadHomeView(startQuiz);
});

function startQuiz(name, quizId) {
  studentName = name;
  currentQuiz = quizId;
  currentQuestionIndex = 0;
  score = 0;
  startTime = Date.now();
  loadQuizView(quizId, currentQuestionIndex, handleNextQuestion);
}

async function handleNextQuestion(correct) {
  if (correct) score++;
  currentQuestionIndex++;
  
  // Assume 5 questions per quiz
  if (currentQuestionIndex >= 5) {
    const percent = (score / 5) * 100;
    const message = percent >= 80
      ? `Congratulations ${studentName}, you pass the quiz!`
      : `Sorry ${studentName}, you fail the quiz.`;
    loadResultView(message);
  } else {
    loadQuizView(currentQuiz, currentQuestionIndex, handleNextQuestion);
  }
}
