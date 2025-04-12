// views.js

import { loadTemplate } from './utils.js';

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
          import('./app.js').then(module => {
            if (module && module.handleStartQuizSubmit) {
              module.handleStartQuizSubmit(selectedQuizId);
            } else {
              console.error('appModule not loaded yet or handleStartQuizSubmit not found.');
            }
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

    if (gotItBtn) {
      gotItBtn.addEventListener('click', () => {
        console.log('Got It button clicked');
        import('./app.js').then(module => {
          if (module && module.incrementQuestionAndRender) {
            module.incrementQuestionAndRender();
          } else {
            console.error('appModule not loaded yet or incrementQuestionAndRender not found.');
          }
        });
      });
    }
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

    setTimeout(() => {
      const restartBtn = container.querySelector('#restart-btn');
      console.log('Retake Button in showResult (after timeout):', restartBtn);

      if (restartBtn) {
        restartBtn.addEventListener('click', async () => { // Make the callback async
          console.log('Retake Quiz button clicked');
          try {
            const module = await import('./app.js'); // Await the import
            if (module && module.renderStartScreen) {
              module.renderStartScreen();
              console.log('renderStartScreen called');
            } else {
              console.error('appModule not loaded yet or renderStartScreen not found.');
            }
          } catch (error) {
            console.error('Error importing app.js:', error);
          }
        });
        console.log('Event listener attached to Retake button.');
      }
    }, 0);
  },
};