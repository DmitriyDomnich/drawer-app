import { Redrawer } from "./redrawer";
import { RedrawerContext } from "./redrawer-context.model";

export class ArcRedrawer extends Redrawer {
  constructor(
    protected redrawerContext: RedrawerContext,
    private x: number,
    private y: number
  ) {
    super(redrawerContext);
  }

  draw(radius?: number) {
    this.setContextSettings();

    const { ctx } = this.redrawerContext;

    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.redrawerContext.settings.lineWidth / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.beginPath();
  }
}
