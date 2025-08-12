
export class Timer {
  constructor(displayElement) {
    this.displayElement = displayElement;
    this.intervalId = null;
    this.startTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  reset() {
    this.stop();
    this.startTime = null;
    this.displayElement.textContent = '00:00';
  }

  update() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    this.displayElement.textContent = `${minutes}:${seconds}`;
  }
}
