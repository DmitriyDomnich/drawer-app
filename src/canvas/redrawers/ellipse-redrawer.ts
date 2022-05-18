import { Redrawer } from "./redrawer";
import { RedrawerContext } from "./redrawer-context.model";

export type Ellipse = {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
};

export class EllipseRedrawer extends Redrawer {
  constructor(
    protected redrawerContext: RedrawerContext,
    private ellipse: Ellipse
  ) {
    super(redrawerContext);
  }

  draw(): void {
    this.setContextSettings();

    const { ctx } = this.redrawerContext;
    const { radiusX, radiusY, x, y } = this.ellipse;

    ctx.beginPath();

    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
