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
  #timer;
  constructor(timerName, timer = 0) {
    this.id = Math.floor(Math.random() * 1000000000).toString();
    this.#name = timerName.toString();
    this.#timer = +timer;
  }

  incrementTimer() {
    this.#timer++;
    return this;
  }

  changeName(newName) {
    this.#name = newName;
    return this;
  }
}

const task01 = new Task('Сверстать сайт', 55).incrementTimer();
console.log('task01: ', task01);

// Модуль 4 урок 4

class TomatoTimer {
  constructor(
      taskTime = 25,
      shortBreakTime = 5,
      longBreakTime = 15,
      tasks = [],
  ) {
    this.taskTime = taskTime;
    this.shortBreakTime = shortBreakTime;
    this.longBreakTime = longBreakTime;
    this.tasks = tasks;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  activateTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      console.log(`Задача ${id} активирована`);
      this.activeTask = task;
      this.startTask();
    } else {
      throw new Error('Задача не найдена');
    }
  }

  startTask() {
    console.log('Задача запущена');

    const activeTaskTime = setInterval(() => {
      activeTaskTime.currentTime -= 1;

      if (activeTaskTime.currentTime <= 0) {
        this.completeTask();
      }
    }, 1000);

    const activeTaskTimeCurrent = this.activeTask.time;
    activeTaskTime.currentTime = activeTaskTimeCurrent;
  }
}

const timer = new TomatoTimer();
console.log('timer: ', timer);
