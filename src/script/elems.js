const STORAGE_KEY = 'tomato';
const windowTimerText = document.querySelector('.window__timer-text');
const btnStart = document.querySelector('.window__buttons .button-primary');
const btnStop = document.querySelector('.window__buttons .button-secondary');
const tasksList = document.querySelector('.tasks__list');
const tasksDeadline = document.querySelector('.tasks__deadline');
const tasksForm = document.querySelector('.task-form');
const windowPanel = document.querySelector('.window__panel');

export default {
  STORAGE_KEY,
  windowTimerText,
  btnStart,
  btnStop,
  tasksList,
  tasksDeadline,
  tasksForm,
  windowPanel,
};