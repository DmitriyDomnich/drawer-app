import { Redrawer } from "./redrawer";
import { RedrawerContext } from "./redrawer-context.model";

export class LineRedrawer extends Redrawer {
  constructor(
    protected redrawerContext: RedrawerContext,
    private x: number,
    private y: number
  ) {
    super(redrawerContext);
  }
  draw() {
    this.setContextSettings();

    const { ctx } = this.redrawerContext;

    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
  }
}
