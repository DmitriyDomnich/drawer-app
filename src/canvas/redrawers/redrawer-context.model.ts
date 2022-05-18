export type ContextSettings = "fillStyle" | "strokeStyle" | "lineWidth";
export interface RedrawerContext {
  ctx: CanvasRenderingContext2D;
  settings: Record<ContextSettings, any>;
}
