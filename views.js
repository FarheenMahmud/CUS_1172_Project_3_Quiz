import { loadTemplate } from './js/utils.js';

export const Views = {
  async showStart(container) {
    const html = await loadTemplate('start');
    container.innerHTML = html;
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
