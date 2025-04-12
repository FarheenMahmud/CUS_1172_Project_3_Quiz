// views.js

import { loadTemplate } from './utils.js';
import { renderStartScreen } from './app.js'; // Import renderStartScreen
import { renderCurrentQuestion } from './app.js'; // Import renderCurrentQuestion

export const Views = {
  async showStart(container, context) {
    const html = await loadTemplate('home', {});
    container.innerHTML = html;
    const form = container.querySelector('#start-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('#name');
        const quizSelect = form.querySelector('#quiz');
        if (nameInput && quizSelect) {
          window.studentName = nameInput.value.trim();
          const selectedQuizId = quizSelect.value;
          // Assuming handleStartQuizSubmit is in app.js and correctly loads the quiz
          import('./app.js').then(module => {
            module.handleStartQuizSubmit(selectedQuizId);
          });
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

  async showWrong(container, { explanation }) {
    const html = await loadTemplate('feedback-wrong', { explanation });
    container.innerHTML = html;

    const gotItBtn = container.querySelector('.got-it-btn');
    console.log('Got It Button in showWrong:', gotItBtn);

    return () => { // Return a function that attaches the listener and calls renderNextQuestion
      if (gotItBtn) {
        gotItBtn.addEventListener('click', () => {
          console.log('Got It button clicked');
          import('./app.js').then(module => {
            module.incrementQuestionAndRender(); // Assuming you'll create this in app.js
          });
        });
      }
    };
  },

  async showResult(container, { studentName, score, totalQuestions }) {
    const passed = score / totalQuestions >= 0.8;
    const resultMessage = passed ? `You passed the quiz 🎉` : `You did not pass 😢`;
    const html = await loadTemplate('results', {
      name: studentName,
      score,
      total: totalQuestions,
      resultMessage
    });
    container.innerHTML = html;

    const restartBtn = container.querySelector('#restart-btn');
    console.log('Retake Button in showResult:', restartBtn);

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        console.log('Retake Quiz button clicked');
        import('./app.js').then(module => {
          module.renderStartScreen(); // Call the renderStartScreen function
        });
      });
    }
  },
};