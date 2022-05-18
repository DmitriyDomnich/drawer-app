import {
  filter,
  fromEvent,
  map,
  merge,
  mergeWith,
  Observable,
  tap,
} from "rxjs";
import { EllipseDrawer } from "./drawers/ellipse-drawer";
import { Drawer } from "./drawers/drawer";
import { LineDrawer } from "./drawers/line-drawer";
import { RectangleDrawer } from "./drawers/rectangle-drawer";

export class CanvasSettings {
  private strokeColorBeforeEraserOn: string | CanvasGradient | CanvasPattern;
  private helperCanvas = <HTMLCanvasElement>(
    document.getElementById("helper-canvas")
  );

  private toggleEraser$ = fromEvent<MouseEvent>(
    document.querySelector("#eraser-btn")!,
    "click"
  );
  public onDrawerChangeButtonsClick$: Observable<Drawer> = merge(
    fromEvent<MouseEvent>(document.getElementById("brush-btn")!, "click").pipe(
      tap((mouseEv) => {
        console.log("BRUSH ACTIVATED");
        this.ctx.canvas.style.cursor = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--brush");

        this.strokeStyle = this.strokeColorBeforeEraserOn;
        this.toggleButtons(<HTMLButtonElement>mouseEv.currentTarget);
      }),
      map((_) => new LineDrawer(this.ctx))
    ),
    this.toggleEraser$.pipe(
      tap((mouseEv) => {
        console.log("ERASER ACTIVATED");
        this.ctx.canvas.style.cursor = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--eraser");

        this.strokeColorBeforeEraserOn = this.strokeStyle;
        this.strokeStyle = getComputedStyle(document.body).backgroundColor;
        this.toggleButtons(<HTMLButtonElement>mouseEv.currentTarget);
      }),
      map((_) => new LineDrawer(this.ctx))
    ),
    fromEvent(document.getElementById("rectangle-btn")!, "click").pipe(
      tap(({ currentTarget }) => {
        this.ctx.canvas.style.cursor = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--square");
        this.strokeStyle = this.strokeColorBeforeEraserOn;
        this.toggleButtons(
          <HTMLButtonElement>document.getElementById("figure-insert-btn"),
          <HTMLButtonElement>currentTarget
        );
      }),
      map(
        (_) =>
          new RectangleDrawer(this.ctx, this.helperCanvas.getContext("2d")!)
      )
    ),
    fromEvent<MouseEvent>(
      document.getElementById("ellipse-btn")!,
      "click"
    ).pipe(
      tap(({ currentTarget }) => {
        this.ctx.canvas.style.cursor = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--circle");
        this.strokeStyle = this.strokeColorBeforeEraserOn;
        this.toggleButtons(
          <HTMLButtonElement>document.getElementById("figure-insert-btn"),
          <HTMLButtonElement>currentTarget
        );
      }),
      map(
        (_) => new EllipseDrawer(this.ctx, this.helperCanvas.getContext("2d")!)
      )
    )
  );

  private colorInput$ = fromEvent<InputEvent>(
    document.querySelector("input[type=color]")!,
    "input"
  ).pipe(
    tap((onColorChanged) => {
      const color = (<HTMLInputElement>onColorChanged.target).value;

      const { classList } = document.getElementById("eraser-btn")!;

      if (classList.contains("active")) {
        this.ctx.canvas.style.cursor = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--brush");
        this.toggleButtons(
          <HTMLButtonElement>document.getElementById("brush-btn")
        );
      }
      this.strokeColorBeforeEraserOn = color;

      this.strokeStyle = color;
    })
  );
  private brushWidthChange$ = fromEvent<InputEvent>(
    document.querySelector("input[type=number]")!,
    "input"
  ).pipe(
    filter((onBrushWidthChanged) => {
      const widthInputEl = <HTMLInputElement>onBrushWidthChanged.target;
      if (+widthInputEl.value <= 30 && +widthInputEl.value >= 0) {
        return true;
      }
      +widthInputEl.value <= 15
        ? ((widthInputEl.value = "1"), (this.lineWidth = 1))
        : ((widthInputEl.value = "30"), (this.lineWidth = 30));
      return false;
    }),
    tap(
      (onBrushWidthChanged) =>
        (this.lineWidth = +(<HTMLInputElement>onBrushWidthChanged.target).value)
    )
  );

  constructor(private ctx: CanvasRenderingContext2D) {
    const defaultColor = "#C11515";

    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    this.strokeStyle = defaultColor;
    this.strokeColorBeforeEraserOn = defaultColor;

    this.helperCanvas.width = ctx.canvas.width;
    this.helperCanvas.height = ctx.canvas.height;

    this.colorInput$
      .pipe(mergeWith(this.brushWidthChange$, this.toggleEraser$))
      .subscribe();
  }

  get strokeStyle() {
    return this.ctx.strokeStyle;
  }
  set strokeStyle(color: string | CanvasGradient | CanvasPattern) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
  }

  get lineWidth() {
    return this.ctx.lineWidth;
  }
  set lineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  get fillStyle() {
    return this.ctx.fillStyle;
  }

  private toggleButtons(
    toggledBtnEl: HTMLButtonElement,
    figureBtnEl?: HTMLButtonElement
  ) {
    Array.from(document.querySelectorAll("button[data-state-toggle]")).forEach(
      (btnEl) => {
        if (toggledBtnEl === btnEl || figureBtnEl === btnEl) {
          // * easy to refactor
          btnEl.classList.add("active");
        } else {
          btnEl.classList.remove("active");
        }
      }
    );
  }
}
