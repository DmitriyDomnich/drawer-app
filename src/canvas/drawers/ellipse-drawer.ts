import { fromEvent, merge, Observable, switchMap, takeUntil, tap } from "rxjs";
import { EllipseRedrawer } from "../redrawers/ellipse-redrawer";
import { Drawer } from "./drawer";

export class EllipseDrawer extends Drawer {
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
            this.helperCtx.beginPath();

            this.helperCtx.ellipse(
              initX,
              initY,
              Math.abs(initX - moveX),
              Math.abs(initY - moveY),
              0,
              0,
              Math.PI * 2
            );
            this.helperCtx.stroke();
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
                  this.ctx.beginPath();

                  const radiusX = Math.abs(initX - finalX);
                  const radiusY = Math.abs(initY - finalY);

                  this.ctx.ellipse(
                    initX,
                    initY,
                    radiusX,
                    radiusY,
                    0,
                    0,
                    Math.PI * 2
                  );
                  this.ctx.fill();

                  this.redrawService.startDraw(
                    new EllipseRedrawer(this.getRedrawerContext(), {
                      radiusX,
                      radiusY,
                      x: initX,
                      y: initY,
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
