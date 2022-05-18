import { ContextSettings, RedrawerContext } from "./redrawer-context.model";

export abstract class Redrawer {
  constructor(protected redrawerContext: RedrawerContext) {}
  abstract draw(): void;

  protected setContextSettings() {
    for (const key in this.redrawerContext.settings) {
      this.redrawerContext.ctx[<ContextSettings>key] =
        this.redrawerContext.settings[<ContextSettings>key];
    }
  }
}
