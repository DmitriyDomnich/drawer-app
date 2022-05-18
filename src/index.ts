import "./styles/main.scss";
import "./assets/images/abstract-shape.png";
import { CanvasHandler } from "./canvas/canvas-handler";
import { Tooltip } from "bootstrap";

const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;

new CanvasHandler(canvas);

document
  .querySelectorAll('[data-bs-toggle="tooltip"]')
  .forEach(function (tooltipTriggerEl) {
    new Tooltip(tooltipTriggerEl);
  });
