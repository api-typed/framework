type Tick = ReturnType<NodeJS.HRTime>;
type Precision = 's' | 'ms' | 'ns';

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

export class Timer {
  public readonly start: Tick;

  private _time: Tick;
  get time() {
    return this._time;
  }

  constructor() {
    this.start = process.hrtime();
  }

  public stop(precision: Precision = 'ms'): number {
    if (this._time) {
      throw new Error('Timer already stopped');
    }

    this._time = process.hrtime(this.start);

    return this.toNumber(precision);
  }

  public toNumber(precision: Precision = 'ms'): number {
    if (!this._time) {
      throw new Error("Timer hasn't been stopped yet!");
    }

    const ns = this._time[0] * NS_PER_SEC + this._time[1];

    switch (precision) {
      case 's':
        return Math.round(ns / NS_PER_SEC);

      case 'ms':
        return Math.round(ns / NS_PER_MS);

      case 'ns':
      default:
        return ns;
    }
  }
}
