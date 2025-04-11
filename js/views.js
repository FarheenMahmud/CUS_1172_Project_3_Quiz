import { loadTemplate } from './utils.js';

export const Views = {
  async showStart(container) {
    const templateSource = document.getElementById('start').innerHTML;
    const template = Handlebars.compile(templateSource);
    const html = template({}); // No context needed for this simple template
    container.innerHTML = html;
    const form = container.querySelector('#start-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('input[name="name"]');
        const quizSelect = form.querySelector('select[name="quiz"]');

        console.log('handleStartQuiz (inline) called');
        console.log('nameInput (inline):', nameInput);
        console.log('quizSelect (inline):', quizSelect);

        if (nameInput && quizSelect) {
          studentName = nameInput.value.trim();
          const selectedQuizId = quizSelect.value;
          loadQuiz(selectedQuizId);
        } else {
          console.error("Name or quiz input elements NOT FOUND (inline).");
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
    }[question.type];

    const html = await loadTemplate(templateName, question);
    container.innerHTML = html;
  },

  async showCorrect(container) {
    const html = await loadTemplate('feedback-correct');
    container.innerHTML = html;
    setTimeout(() => container.innerHTML = '', 1000);
  },

  async showWrong(container, explanation) {
    const html = await loadTemplate('feedback-wrong', { explanation });
    container.innerHTML = html;
  },

  async showResult(container, { name, score, total }) {
    const passed = score / total >= 0.8;
    const resultMessage = passed ? `You passed the quiz 🎉` : `You did not pass 😢`;
    const html = await loadTemplate('result', { name, score, total, resultMessage });
    container.innerHTML = html;
  }
};
