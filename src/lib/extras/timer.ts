/* eslint-disable no-underscore-dangle */
export class Timer {
  name: string;

  _start: number;

  constructor(name: string) {
    this.name = name;
    this._start = Date.now();
  }

  toString() {
    return `${this.name}:${this.duration}ms`;
  }

  get duration() {
    return Date.now() - this._start;
  }

  isSlow(slow: number) {
    return this.duration > slow;
  }
}
