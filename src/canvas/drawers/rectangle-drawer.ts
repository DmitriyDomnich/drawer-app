import { fromEvent, merge, Observable, switchMap, takeUntil, tap } from "rxjs";
import { RectangleRedrawer } from "../redrawers/rectangle-redrawer";
import { Drawer } from "./drawer";

export class RectangleDrawer extends Drawer {
  constructor(
    protected ctx: CanvasRenderingContext2D,
    private helperCtx: CanvasRenderingContext2D
  ) {
    super(ctx);
  }
  getDrawer$(): Observable<any> {
    const canvas = this.ctx.canvas;
    const helperCanvas = this.helperCtx.canvas;

    return fromEvent<MouseEvent>(canvas, "mousedown").pipe(
      tap((_) => (this.helperCtx.strokeStyle = this.ctx.strokeStyle)),
      switchMap(({ offsetX: initX, offsetY: initY }) =>
        fromEvent<MouseEvent>(canvas, "mousemove").pipe(
          tap(({ offsetX: moveX, offsetY: moveY }) => {
            this.helperCtx.clearRect(
              0,
              0,
              helperCanvas.width,
              helperCanvas.height
            );
            this.helperCtx.strokeRect(
              initX,
              initY,
              moveX - initX,
              moveY - initY
            );
          }),
          takeUntil(
            merge(
              fromEvent<MouseEvent>(canvas, "mouseleave").pipe(
                tap((_) =>
                  this.helperCtx.clearRect(
                    0,
                    0,
                    helperCanvas.width,
                    helperCanvas.height
                  )
                )
              ),
              fromEvent<MouseEvent>(canvas, "mouseup").pipe(
                tap(({ offsetX: finalX, offsetY: finalY }) => {
                  this.helperCtx.clearRect(
                    0,
                    0,
                    helperCanvas.width,
                    helperCanvas.height
                  );
                  this.ctx.fillRect(
                    initX,
                    initY,
                    finalX - initX,
                    finalY - initY
                  );
                  this.redrawService.startDraw(
                    new RectangleRedrawer(this.getRedrawerContext(), {
                      x: initX,
                      y: initY,
                      width: finalX - initX,
                      height: finalY - initY,
                    })
                  );
                  this.historyService.addSnapshot(
                    this.ctx.getImageData(0, 0, canvas.width, canvas.height)
                  );
                })
              )
            )
          )
        )
      )
    );
  }
}
