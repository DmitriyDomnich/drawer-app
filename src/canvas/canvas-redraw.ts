import { concatMap, delay, finalize, from, of, tap } from "rxjs";
import { Redrawer } from "./redrawers/redrawer";

export class CanvasRedraw {
  private history: Array<Array<Redrawer>> = [];
  private cache: Array<Array<Redrawer>> = [];

  private static instance: CanvasRedraw;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CanvasRedraw();
    }
    return this.instance;
  }

  startDraw(redrawer: Redrawer) {
    this.history.push([redrawer]);
  }
  drawing(redrawer: Redrawer) {
    this.history[this.history.length - 1].push(redrawer);
  }
  removeLastDraw() {
    const item = this.history.pop();
    if (item) {
      this.cache.push(item);
    }
  }
  appendLastHistoryFromCache() {
    const item = this.cache.pop();
    if (item) {
      this.history.push(item);
    }
  }
  redraw() {
    return from(this.history.flat()).pipe(
      concatMap((redrawer) =>
        of(redrawer).pipe(
          delay(20),
          tap((redrawer) => redrawer.draw())
        )
      ),
      finalize(() => {
        console.log("finalize");
        this.history = [];
        this.cache = [];
      })
    );
  }
  reset() {
    this.cache = [];
    this.history = [];
  }
}
