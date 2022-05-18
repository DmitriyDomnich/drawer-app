import { Redrawer } from "./redrawer";
import { RedrawerContext } from "./redrawer-context.model";

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class RectangleRedrawer extends Redrawer {
  constructor(
    protected redrawerContext: RedrawerContext,
    private rectangle: Rectangle
  ) {
    super(redrawerContext);
  }

  draw(): void {
    this.setContextSettings();
    const { x, y, height, width } = this.rectangle;

    this.redrawerContext.ctx.fillRect(x, y, width, height);
  }
}
