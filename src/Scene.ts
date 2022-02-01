import { Texture } from "pixi.js";
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const renderer = new WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const threeDisplay = Texture.from(renderer.domElement);

const mainScene = new Scene();

// camera
const orbitCamera = new PerspectiveCamera(35,window.innerWidth / window.innerHeight,0.1,1000);
orbitCamera.position.set(0.0, 1.4, 0.7);

// controls
const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0.0, 1.4, 0.0);
orbitControls.update();

const light = new DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
mainScene.add(light);

export { mainScene, orbitCamera, threeDisplay, renderer };