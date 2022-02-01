import { Application, Sprite } from "pixi.js";
import { threeDisplay } from "./Scene";

const app = new Application({
  height: innerHeight,
  width: innerWidth,
  antialias: true,
  powerPreference: 'high-performance',
  backgroundColor: 0xffffff
});

const Stage = app.stage,
  View = app.view,
  Loader = app.loader;

Stage.interactive = true;
Stage.addChild(new Sprite(threeDisplay));

export { Stage, View, Loader };