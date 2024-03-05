import './scss/index.scss';

import soundfile from './audio/beep.mp3';
import elems from './script/elems.js';

const {
  STORAGE_KEY,
  windowTimerText,
  btnStart,
  btnStop,
  tasksList,
  tasksDeadline,
  tasksForm,
  windowPanel,
} = elems;

btnStart.classList.add('hidden');
windowTimerText.textContent = '00:00';
tasksList.textContent = '';
windowPanel.textContent = '';

let count = 0;

const imp = ['default', 'important', 'so-so'];
document.querySelector('.button-importance')
    .addEventListener('click', ({target}) => {
      count += 1;
      if (count >= imp.length) {
        count = 0;
      }

      for (let i = 0; i < imp.length; i++) {
        if (count === i) {
          target.classList.add(imp[i]);
        } else {
          target.classList.remove(imp[i]);
        }
      }
    });

export class TomatoTimer {
  constructor({
    taskTime = 25,
    smallPauseTime = 5,
    bigPauseTime = 15,
  } = {}) {
    if (TomatoTimer.instance) {
      return TomatoTimer.instance;
    }
    this.taskTime = taskTime * 60;
    this.smallPauseTime = smallPauseTime * 60;
    this.bigPauseTime = bigPauseTime * 60;
    this.tasks = this.getStorage(STORAGE_KEY);
    this.activeTask = null;
    TomatoTimer.instance = this;
    this.audio = new Audio(soundfile);
    this.timerId = 0;
    this.fullTime = this.tasks.length ? this.getFullTime(STORAGE_KEY) : 0;

    if (this.tasks.length > 0) {
      this.renderTasksList(this.tasks);
    }
  }

  getFullTime(key) {
    const data = this.getStorage(key);
    let counter = 0;
    data.forEach(item => {
      counter += item.counter;
    });

    const fullTime = counter * this.taskTime;
    
    const {hours, minutes, seconds} = this.convertSeconds(fullTime);
    tasksDeadline.textContent = seconds > 0 ? `${hours} ч ${minutes} мин ${seconds} сек` : `${hours} ч ${minutes} мин`;
    return fullTime;
  }

  getStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }
    
  setStorage(key, value) {
    const data = this.getStorage(key);
    data.push(value);
    localStorage.setItem(key, JSON.stringify(data));
  };

  removeStorage(key, id) {
    const data = this.getStorage(key);
    const filteredData = data.filter(item => {
      return item.id !== id
    });
    localStorage.setItem(key, JSON.stringify(filteredData));
  };

  updateStorage(key, id, counter) {
    const data = this.getStorage(key);
    const updatedItem = data.find(item => item.id === id);
    updatedItem.finished = true;
    updatedItem.counter = counter;
    localStorage.setItem(key, JSON.stringify(data));
  }

  renderTasksList(data) {
    let task;
    data.map(item => {
      if (item.importance === 'important') {
        task = new ImportantTask(item.importance);
      }
      
      if (item.importance === 'default') {
        task = new StandardTask(item.importance);
      }
      
      if (item.importance === 'so-so') {
        task = new UnimportantTask(item.importance);
      }

      task.renderTask(item);
    });
  }

  addTask(task) {
    this.tasks.push(task);
  }

  activateTask(id) {
    const task = this.findTaskById(this.tasks, id);
    this.renderWindowpanel(task.text, task.counter);

    if (task) {
      this.activeTask = task;

      const {minutes, seconds} = this.convertSeconds(this.taskTime);
      windowTimerText.textContent = `${minutes}:${seconds}`;
      btnStart.classList.remove('hidden');
      btnStart.style.pointerEvents = '';
    } else {
      throw new Error('Задача не найдена');
    }
  }

  stopTimer() {
    clearTimeout(this.timerId);
    tasksList.style.pointerEvents = '';
    btnStart.classList.add('hidden');
    btnStop.classList.add('hidden');

    const text = document.createElement('p');
    text.style.cssText = `
      margin: -36px 0 30px;
      text-align: center;
      font-size: 30px;
      color: #333333;
      line-height: 1.2;
    `;
    text.textContent = 'Задача выполнена!';
    windowTimerText.insertAdjacentElement('afterend', text);

    this.getElapsedTime();
    
    const {hours, minutes, seconds} = this.convertSeconds(this.fullTime);
    tasksDeadline.textContent = seconds > 0 ? `${hours} ч ${minutes} мин ${seconds} сек` : `${hours} ч ${minutes} мин`;

    const taskID = this.activeTask.id;

    const tasksText = document.querySelectorAll('.tasks__text');
    tasksText.forEach(task => {
      if (+task.dataset.id === taskID) {
        task.classList.remove('tasks__text_active');
      };
    });

    windowTimerText.textContent = '00:00';
    windowPanel.textContent = '';

    setTimeout(() => {
      text.remove();
    }, 2000);
    this.updateStorage(STORAGE_KEY, taskID, this.activeTask.counter);
    Task.deleteTask(taskID, false);
  }

  getElapsedTime() {
    const time = windowTimerText.textContent;
    const regex = /(\d+)/g;
    const elapsedTime = this.taskTime - Number(time.match(regex)[1]);
    this.fullTime += elapsedTime;
  }

  renderWindowpanel(text, counter) {
    windowPanel.textContent = '';
    const windowPanelTitle = document.createElement('p');
    windowPanelTitle.classList.add('window__panel-title');
    windowPanelTitle.textContent = text;

    const windowPanelTaskText = document.createElement('p');
    windowPanelTaskText.classList.add('window__panel-task-text');
    windowPanelTaskText.textContent = `Томат ${counter}`;

    windowPanel.append(windowPanelTitle, windowPanelTaskText);
  }

  findTaskById(array, id) {
    return array.find(obj => obj.id === +id);
  }

  startTimer() {
    if (this.activeTask) {
      btnStart.classList.add('hidden');
      btnStop.classList.remove('hidden');
      tasksList.style.pointerEvents = 'none';

      let count = this.taskTime;
      this.start(count);
    } else {
      throw new Error('Нет активной задачи');
    }
  }

  start(count) {
    const {minutes, seconds} = this.convertSeconds(count);
    windowTimerText.textContent = `${minutes}:${seconds}`;
    count -= 1;

    if (count >= 0) {
      this.timerId = setTimeout(() => {
        this.start(count);
      }, 1000);
    }

    if (count < 0) {
      this.playSound();

      if (this.activeTask.counter > 0 && this.activeTask.counter % 3 === 0) {
        this.bigBreak();
      } else {
        this.shortBreak();
      }
      this.fullTime += this.taskTime;
    }
  }

  bigBreak() {
    const taskID = this.activeTask.id;
    btnStop.classList.add('hidden');

    const text = document.createElement('p');
    text.style.cssText = `
      margin: -36px 0 30px;
      text-align: center;
      font-size: 30px;
      color: #333333;
      line-height: 1.2;
    `;
    text.textContent = `Перерыв ${this.bigPauseTime / 60} минут`;
    windowTimerText.insertAdjacentElement('afterend', text);

    let count = this.bigPauseTime;
    const bigTimerId = setInterval(() => {
      const {minutes, seconds} = this.convertSeconds(count);
      windowTimerText.textContent = `${minutes}:${seconds}`;
      count -= 1;
      if (count < 0) {
        this.playSound();
        clearInterval(bigTimerId);
        text.remove();
        const {minutes, seconds} = this.convertSeconds(this.taskTime);
        windowTimerText.textContent = `${minutes}:${seconds}`;
        btnStop.style.pointerEvents = '';
        this.startTimer();
      }
    }, 1000);
    this.increaseCounterByOne(taskID);
  }

  shortBreak() {
    const taskID = this.activeTask.id;
    btnStop.classList.add('hidden');

    const text = document.createElement('p');
    text.style.cssText = `
      margin: -36px 0 30px;
      text-align: center;
      font-size: 30px;
      color: #333333;
      line-height: 1.2;
    `;
    text.textContent = `Перерыв ${this.smallPauseTime / 60} минут`;
    windowTimerText.insertAdjacentElement('afterend', text);

    let count = this.smallPauseTime;
    const shortTimerId = setInterval(() => {
      const {minutes, seconds} = this.convertSeconds(count);
      windowTimerText.textContent = `${minutes}:${seconds}`;
      count -= 1;
      if (count < 0) {
        this.playSound();
        clearInterval(shortTimerId);
        text.remove();
        const {minutes, seconds} = this.convertSeconds(this.taskTime);
        windowTimerText.textContent = `${minutes}:${seconds}`;
        btnStop.style.pointerEvents = '';
        this.startTimer();
      }
    }, 1000);
    this.increaseCounterByOne(taskID);
  }

  playSound() {
    this.audio.play();
  }

  convertSeconds(time) {
    let hours = Math.floor(time / 3600);
    const remainingSeconds = time % 3600;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return {hours, minutes, seconds};
  }

  increaseCounterByOne(id) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === id) {
        Task.incrementCounter(this.tasks[i]);
      }
    }
  }
}

class Task {
  constructor(taskText, counter = 0) {
    this.id = Math.floor(Math.random() * 1000000000);
    this.text = taskText;
    this.counter = +counter;
  }

  static incrementCounter(task) {
    task.counter++;
    const windowPanelTaskText = document.querySelector('.window__panel-task-text');
    windowPanelTaskText.textContent = `Томат ${task.counter}`;
    return this;
  }

  changeName(newName) {
    this.text = newName;
    return this;
  }

  renderTask({id, text, counter, importance, finished}) {
    const li = document.createElement('li');
    li.classList.add('tasks__item', importance);

    const span = document.createElement('span');
    span.classList.add('count-number');
    span.textContent = counter;

    const tasksText = document.createElement('button');
    tasksText.dataset.id = id;
    tasksText.classList.add('tasks__text');
    tasksText.textContent = text;
    if(finished) {
      tasksText.style.cssText = `
        text-decoration: line-through;
        pointer-events: none;
      `;
    } 

    const tasksBtn = document.createElement('button');
    tasksBtn.classList.add('tasks__button');

    const popup = document.createElement('div');
    popup.classList.add('popup');

    const editBtn = document.createElement('button');
    editBtn.classList.add('popup__button', 'popup__edit-button');
    editBtn.textContent = 'Редактировать';

    const deletetBtn = document.createElement('button');
    deletetBtn.classList.add('popup__button', 'popup__delete-button');
    deletetBtn.textContent = 'Удалить';

    popup.append(editBtn, deletetBtn);

    li.append(span, tasksText, tasksBtn, popup);

    tasksList.append(li);

    editBtn.addEventListener('click', () => {
      // ! Редактирование таски
    });

    deletetBtn.addEventListener('click', ({target}) => {
      const task = target.parentElement.parentElement;
      const taskId = task.querySelector('[data-id]').dataset.id;
      popup.classList.remove('popup_active');
      this.openModal(taskId);
    });
  }

  openModal(id) {
    const modal = this.renderModal();
    modal.style.display = 'block';
    document.body.append(modal);

    modal.addEventListener('click', ({target}) => {
      if (target.classList.contains('modal-delete__close-button') || target.classList.contains('modal-delete__cancel-button') || target === modal) {
        modal.remove();
      }

      if (target.classList.contains('modal-delete__delete-button')) {
        modal.remove();
        Task.deleteTask(id);
      }
    });
  }

  static deleteTask(id, flag = true) {
    const tasks = document.querySelectorAll('.tasks__text');

    if (tasks.length > 0) {
      tasks.forEach(task => {
        if (+task.dataset.id === +id) {
          const li = task.parentElement;

          if (flag) {
            timer.tasks = timer.tasks.filter(item => item.id !== +id);
            timer.removeStorage(STORAGE_KEY, +id);
            li.remove();
          } else {
            task.style.cssText = `
              text-decoration: line-through;
              pointer-events: none;
            `;

            const number = timer.findTaskById(timer.tasks, id).counter;
            li.querySelector('.count-number').textContent = number;
          }
        }
      })
    }
    timer.activeTask = null;
  }

  renderModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
  
    const modalDelete = document.createElement('div');
    modalDelete.classList.add('modal-delete');
  
    const modalTitle = document.createElement('p');
    modalTitle.classList.add('modal-delete__title');
    modalTitle.textContent = 'Удалить задачу?';
    
    const modalClose = document.createElement('button');
    modalClose.classList.add('modal-delete__close-button');
    modalClose.ariaLabel = 'Закрыть модальное окно';
  
    const modalDeleteBtn = document.createElement('button');
    modalDeleteBtn.classList.add('modal-delete__delete-button', 'button-primary');
    modalDeleteBtn.textContent = 'Удалить';
  
    const modalCancel = document.createElement('button');
    modalCancel.classList.add('modal-delete__cancel-button');
    modalCancel.textContent = 'Отмена';
    
    modalDelete.append(modalTitle, modalClose, modalDeleteBtn, modalCancel);
    modalOverlay.append(modalDelete);
  
    return modalOverlay;
  }
}

class ImportantTask extends Task {
  importance = 'important';
}

class StandardTask extends Task {
  importance = 'default';
}

class UnimportantTask extends Task {
  importance = 'so-so';
}

tasksForm.addEventListener('submit', (e) => {
  e.preventDefault();
  tasksForm['task-name'].required = 'true';

  const importance = tasksForm.querySelector('.button-importance');
  const data = Object.fromEntries(new FormData(tasksForm));
  
  let task;
  if (importance.classList.contains('important')) {
    task = new ImportantTask(data['task-name']);
  }
  
  if (importance.classList.contains('default')) {
    task = new StandardTask(data['task-name']);
  }
  
  if (importance.classList.contains('so-so')) {
    task = new UnimportantTask(data['task-name']);
  }

  timer.addTask(task);
  timer.setStorage(STORAGE_KEY, task);
  task.renderTask(task);
  tasksForm.reset();
});

tasksList.addEventListener('click', ({target}) => {
  const popups = document.querySelectorAll('.popup');
  if (popups) {
    popups.forEach(popup => popup.classList.remove('popup_active'));
  }

  if (target.classList.contains('tasks__text')) {
    const id = target.dataset.id;
    const tasksText = tasksList.querySelectorAll('.tasks__text');
  
    tasksText.forEach(item => {
      
      item.classList.remove('tasks__text_active');
      target.classList.add('tasks__text_active');
    });
    
    if (target.classList.contains('tasks__text_active')) {
      timer.activateTask(id);
    }
  } 
  
  if (target.classList.contains('tasks__button')) {
    target.nextSibling.classList.toggle('popup_active');
  }
});

btnStart.addEventListener('click', () => {
  if (timer.activeTask) {
    btnStop.classList.remove('hidden');
    timer.startTimer();
  }
});

btnStop.addEventListener('click', () => {
  timer.stopTimer();
});


const timer = new TomatoTimer();