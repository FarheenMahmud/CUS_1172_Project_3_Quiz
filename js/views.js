//views.js

import { loadTemplate } from './utils.js';


import { handleStartQuizSubmit } from './app.js'; // Import the handler

export const Views = {
  async showStart(container, context) {
    const html = await loadTemplate('home', {}); // Load the 'home.handlebars' template
    container.innerHTML = html;
    const form = container.querySelector('#start-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('#name'); // Use the ID from home.handlebars
        const quizSelect = form.querySelector('#quiz'); // Use the ID from home.handlebars

        if (nameInput && quizSelect) {
          window.studentName = nameInput.value.trim();
          const selectedQuizId = quizSelect.value;
          handleStartQuizSubmit(selectedQuizId); // Call the handler from app.js
        } else {
          console.error("Name or quiz input elements NOT FOUND (in home.handlebars).");
        }
      });
    } else {
      console.log('Start form not found!');
    }
    return Promise.resolve();
  },




  async showQuestion(container, question) {
    const templateName = {
      'multiple-choice': 'question-mc',
      'narrative': 'question-narrative',
      'image-choice': 'question-image'
    }[question.question?.type];

    const html = await loadTemplate(templateName, question);
    container.innerHTML = html;
  },

  async showCorrect(container) {
    const html = await loadTemplate('feedback-correct');
    container.innerHTML = html;
    setTimeout(() => container.innerHTML = '', 1000);
  },

   async showWrong(container, { explanation, nextQuestionCallback }) { // Receive the callback
    const html = await loadTemplate('feedback-wrong', { explanation });
    container.innerHTML = html;

    const gotItBtn = container.querySelector('.got-it-btn');
    if (gotItBtn && nextQuestionCallback) {
      gotItBtn.addEventListener('click', nextQuestionCallback); // Call the callback
    }
  },
async showResult(container, { studentName, score, totalQuestions }) {
  const passed = score / totalQuestions >= 0.8;
  const resultMessage = passed ? `You passed the quiz 🎉` : `You did not pass 😢`;
  const html = await loadTemplate('results', { // Corrected filename
    name: studentName,
    score,
    total: totalQuestions,
    resultMessage
  });
  container.innerHTML = html;

  const restartBtn = container.querySelector('#restart-btn');
  console.log('Retake Button in showResult:', restartBtn); // Add this log

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      console.log('Retake Quiz button clicked');
      // You need to trigger the start screen from here
      // Consider returning a function or using a custom event
    });
  }
},


};
