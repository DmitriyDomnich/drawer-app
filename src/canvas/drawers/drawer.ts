import { Observable } from "rxjs";
import { CanvasHistory } from "../canvas-history";
import { CanvasRedraw } from "../canvas-redraw";
import { RedrawerContext } from "../redrawers/redrawer-context.model";

export abstract class Drawer {
  protected readonly historyService: CanvasHistory;
  protected readonly redrawService: CanvasRedraw;

  constructor(protected ctx: CanvasRenderingContext2D) {
    this.historyService = CanvasHistory.getInstance();
    this.redrawService = CanvasRedraw.getInstance();
  }

  abstract getDrawer$(): Observable<any>;

  protected getRedrawerContext(): RedrawerContext {
    return {
      ctx: this.ctx,
      settings: {
        fillStyle: this.ctx.fillStyle,
        lineWidth: this.ctx.lineWidth,
        strokeStyle: this.ctx.strokeStyle,
      },
    };
  }
}
