import { EventEmitter } from "eventemitter3";
import { VRM, VRMUtils } from "@pixiv/three-vrm";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mainScene } from "./Scene";

const loader = new GLTFLoader();

class ModelManager extends EventEmitter {
	private static instance: ModelManager;
	private currentModel: VRM | null = null;
	public static getInstance(): ModelManager {
		if (!this.instance) {
			this.instance = new ModelManager();
		}
		return this.instance;
	}

	public loadModel(url: string) {
		loader.load(url, async (gltf: GLTF) => {
			VRMUtils.removeUnnecessaryJoints(gltf.scene);
			const model = await VRM.from(gltf);
			this.currentModel = model;
			model.scene.rotation.y = Math.PI;
			this.emit('modelLoaded', model);
		},
			(progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
			(error) => console.error(error));
	}

	public getModel(): VRM | null{
		if (this.currentModel) {
			return this.currentModel;
		} else {
			return null;
		}
		
	}

	public cleanModel() {
		if (this.currentModel) {
			mainScene.remove(this.currentModel.scene);
			this.currentModel = null;
		}
	}
}

export default ModelManager;