import {
  BehaviorSubject,
  filter,
  finalize,
  fromEvent,
  mergeWith,
  Subscription,
  switchMap,
  tap,
} from "rxjs";
import { CanvasHistory } from "./canvas-history";
import { CanvasRedraw } from "./canvas-redraw";
import { CanvasSettings } from "./canvas-settings";
import { Drawer } from "./drawers/drawer";
import { LineDrawer } from "./drawers/line-drawer";

export class CanvasHandler {
  private ctx: CanvasRenderingContext2D;
  private history: CanvasHistory;
  private redrawService: CanvasRedraw;

  private isRedrawing = false;
  private actionsSubscription: Subscription;
  private drawerChangeSub: Subscription; // just in case

  private onResize$ = fromEvent(window, "resize").pipe(
    tap((_) => {
      // todo: finish later
      const { height, width } = this.canvas.getBoundingClientRect();
      this.canvas.height = height;
      this.canvas.width = width;
    })
  );

  private onPreviousSnapshot$ = fromEvent<KeyboardEvent>(window, "keyup").pipe(
    filter(
      (keyUp) => keyUp.code === "KeyZ" && keyUp.ctrlKey && !keyUp.shiftKey
    ),
    mergeWith(fromEvent(document.getElementById("history-back-btn")!, "click")),
    tap((_) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const prevSnapshot = this.history.getPreviousSnapshot();
      this.redrawService.removeLastDraw();

      if (prevSnapshot) {
        this.ctx.putImageData(prevSnapshot, 0, 0);
      }
    })
  );
  private onNextSnapshot$ = fromEvent<KeyboardEvent>(window, "keyup").pipe(
    filter((keyUp) => keyUp.code === "KeyZ" && keyUp.shiftKey && keyUp.ctrlKey),
    mergeWith(
      fromEvent(document.getElementById("history-forward-btn")!, "click")
    ),
    tap((_) => {
      const nextSnapshot = this.history.getNextSnapshot();
      if (nextSnapshot) {
        this.redrawService.appendLastHistoryFromCache();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(nextSnapshot, 0, 0);
      }
    })
  );
  private onRedraw$ = fromEvent<KeyboardEvent>(window, "keyup")
    .pipe(
      filter((keyup) => keyup.code === "KeyR" && keyup.ctrlKey),
      mergeWith(
        fromEvent<MouseEvent>(document.getElementById("redraw-btn")!, "click")
      ),
      filter((_) => !this.isRedrawing),
      switchMap((_) => {
        this.isRedrawing = true;
        this.actionsSubscription.unsubscribe();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this.redrawService.redraw().pipe(
          finalize(() => {
            this.isRedrawing = false;
            this.history.reset();
            this.actionsSubscription = this.subscribeActions();
          })
        );
      })
    )
    .subscribe();
  private onClear$ = fromEvent<MouseEvent>(
    document.getElementById("clear-canvas-btn")!,
    "click"
  ).pipe(
    mergeWith(
      fromEvent<KeyboardEvent>(window, "keyup").pipe(
        filter((keyup) => keyup.code === "KeyL" && keyup.ctrlKey)
      )
    ),
    tap((_) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.history.reset();
      this.redrawService.reset();
    })
  );

  private drawSubject: BehaviorSubject<Drawer>;

  constructor(private canvas: HTMLCanvasElement) {
    const canvasCoords = canvas.getBoundingClientRect();

    canvas.height = canvasCoords.height;
    canvas.width = canvasCoords.width;

    this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    this.history = CanvasHistory.getInstance();
    this.redrawService = CanvasRedraw.getInstance();
    this.drawerChangeSub = new CanvasSettings(
      this.ctx
    ).onDrawerChangeButtonsClick$
      .pipe(tap((drawer) => this.drawSubject.next(drawer)))
      .subscribe();

    // line drawer as default
    this.drawSubject = new BehaviorSubject<Drawer>(new LineDrawer(this.ctx));
    this.actionsSubscription = this.subscribeActions();
  }

  private subscribeActions() {
    return this.drawSubject
      .pipe(switchMap((drawer) => drawer.getDrawer$()))
      .pipe(
        mergeWith(
          this.onResize$,
          this.onPreviousSnapshot$,
          this.onNextSnapshot$,
          this.onClear$
        )
      )
      .subscribe();
  }
}
