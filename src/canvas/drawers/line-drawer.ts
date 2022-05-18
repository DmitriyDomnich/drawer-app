import {
  finalize,
  fromEvent,
  mergeWith,
  Observable,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { ArcRedrawer } from "../redrawers/arc-redrawer";
import { LineRedrawer } from "../redrawers/line-redrawer";
import { Drawer } from "./drawer";

export class LineDrawer extends Drawer {
  constructor(protected ctx: CanvasRenderingContext2D) {
    super(ctx);
  }
  getDrawer$(): Observable<any> {
    const canvas = this.ctx.canvas;

    return fromEvent<MouseEvent>(canvas, "mousedown").pipe(
      tap(({ offsetX, offsetY }) => {
        this.drawArc(offsetX, offsetY);
        this.redrawService.startDraw(
          new ArcRedrawer(this.getRedrawerContext(), offsetX, offsetY)
        );
        this.ctx.beginPath();
      }),
      switchMap((_) =>
        fromEvent<MouseEvent>(canvas, "mousemove").pipe(
          tap(({ offsetX, offsetY }) => {
            this.redrawService.drawing(
              new LineRedrawer(this.getRedrawerContext(), offsetX, offsetY)
            );

            this.drawLine(offsetX, offsetY);
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY);
          }),
          takeUntil(
            fromEvent(canvas, "mouseup").pipe(
              mergeWith(fromEvent(canvas, "mouseleave")),
              finalize(() => {
                this.historyService.addSnapshot(
                  this.ctx.getImageData(0, 0, canvas.width, canvas.height)
                );
                this.ctx.beginPath();
              })
            )
          )
        )
      )
    );
  }

  private drawArc(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.ctx.lineWidth / 2, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  private drawLine(x: number, y: number) {
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }
}
