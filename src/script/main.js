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

console.log(task01);
