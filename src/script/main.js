/* eslint-disable require-jsdoc */
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

// Модуль 4 урок 3
class Task {
  #name;
  #counter;
  constructor(taskName, counter = 0) {
    this.id = Math.floor(Math.random() * 1000000000).toString();
    this.#name = taskName.toString();
    this.#counter = +counter;
  }

  incrementTimer() {
    this.#counter++;
    return this;
  }

  changeName(newName) {
    this.#name = newName;
    return this;
  }
}


// Модуль 4 урок 4

class TomatoTimer {
  constructor({
    taskTime = 25,
    smallPauseTime = 5,
    bigPauseTime = 10,
    tasks = [],
  } = {}) {
    this.taskTime = taskTime * 60;
    this.smallPauseTime = smallPauseTime * 60;
    this.bigPauseTime = bigPauseTime * 60;
    this.tasks = tasks;
    this.activeTask = null;
  }

  addTask(task) {
    console.log('Добавили задачу: ', task);
    this.tasks.push(task);
  }

  activateTask(id) {
    console.log(this.activeTask);
    const task = this.tasks[id];
    console.log('Активирую задачу:', task);
    if (task) {
      this.activeTask = task;
      console.log(this);
      this.startTimer();
    } else {
      throw new Error('Задача не найдена');
    }
  }

  startTimer() {
    if (this.activeTask) {
      console.log('Запускаю задачу: ', this.activeTask);
      let count = 0;
      const timerId = setInterval(() => {
        count++;
        console.log('count: ', count);
        console.log('this.taskTime: ', this.taskTime);
        if (count >= this.taskTime) {
          clearInterval(timerId);
          if (count % 3 === 0) {
            console.log('запускается большой перерыв');
            this.bigBreak();
          } else {
            console.log('запускается короткий перерыв');
            this.shortBreak();
          }
        }
      }, 1000);
    } else {
      throw new Error('Нет активной задачи');
    }
  }

  bigBreak() {
    console.log('большой перерыв');
    setTimeout(() => {
      console.log('запускаем задачу');
      // this.startTimer();
    }, this.bigPauseTime);
  }

  shortBreak() {
    console.log('короткий перерыв');
    setTimeout(() => {
      console.log('запускаем задачу');
      // this.startTimer();
    }, this.smallPauseTime);
  }

/*
*   4) Увеличить счетчик у задачи (принимает id задачи)
*     Используя метод у задачи меняет её счётчик
*/
}

const task01 = new Task('Сверстать сайт', 15);
console.log('task01: ', task01);

const timer = new TomatoTimer(3);
console.log('timer: ', timer);
timer.addTask(task01);
timer.activateTask(0);
