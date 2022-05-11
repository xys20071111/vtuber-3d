import { Texture } from "pixi.js";
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Color, TextureLoader } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const threeDisplay = Texture.from(renderer.domElement);

const mainScene = new Scene();

const loader = new TextureLoader()
const sceneBackgroud = localStorage.getItem('background')
if (sceneBackgroud) {
	try {
		const data = JSON.parse(sceneBackgroud)
		if (data.type === 'color' || data.type === 'colour') {
			const color = data.data as string
			mainScene.background = new Color(parseInt(color.replace('#', ''), 16));
		} else if (data.type === 'img') {
			const texture = loader.load(data.data)
			mainScene.background = texture
		}
	} catch (e) {
		console.log(e)
		localStorage.removeItem('background')
	}
	
}

// camera
const orbitCamera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
orbitCamera.position.set(0.0, 1.4, 0.7);

// controls
const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0.0, 1.4, 0.0);
orbitControls.update();

const light = new DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
mainScene.add(light);

export { mainScene, orbitCamera, threeDisplay, renderer, loader };
