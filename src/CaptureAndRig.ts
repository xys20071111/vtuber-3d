import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { Quaternion, Euler, Vector3, Clock } from "three";
import { TFace, TPose, Face, Pose, Vector, Utils } from 'kalidokit';
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import ModelManager from "./ModelManager";
import { rigRotation } from "./utils";
import { mainScene, orbitCamera, renderer, threeDisplay } from "./Scene";


const captureVideo: HTMLVideoElement = document.getElementById('capture') as HTMLVideoElement;
const modelManager: ModelManager = ModelManager.getInstance();

const holistic = new Holistic({
	locateFile: (file) => { return `/static/${file}` }
});

holistic.setOptions({
	modelComplexity: 1,
	smoothLandmarks: true,
	minDetectionConfidence: 0.7,
	minTrackingConfidence: 0.7,
	refineFaceLandmarks: true,
});

const captureCamera = new Camera(captureVideo, {
	onFrame: async () => {
		await holistic.send({ image: captureVideo });
	},
	width: 640,
	height: 480
});

holistic.onResults(result => {
	const model = modelManager.getModel();
	if (!model) {
		return;
	}
	if (result.faceLandmarks) {
		const face = Face.solve(result.faceLandmarks, { smoothBlink: true }) as TFace;
		const Blendshape = model.blendShapeProxy;
		const rotation = new Euler(face.head.x, face.head.y, face.head.z)
		model.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Neck)?.quaternion.slerp(new Quaternion().setFromEuler(rotation), 0.7);
		face.eye.l = Vector.lerp(Utils.clamp(1 - face.eye.l, 0, 1), Blendshape?.getValue(VRMSchema.BlendShapePresetName.Blink) as number, 0.5) as number;
		face.eye.r = Vector.lerp(Utils.clamp(1 - face.eye.r, 0, 1), Blendshape?.getValue(VRMSchema.BlendShapePresetName.Blink) as number, 0.5) as number;
		face.eye = Face.stabilizeBlink(face.eye, face.head.y)
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.BlinkL, face.eye.l);
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.BlinkR, face.eye.r);

		// Interpolate and set mouth blendshapes
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.I, Vector.lerp(face.mouth.shape.I, Blendshape.getValue(VRMSchema.BlendShapePresetName.I) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.A, Vector.lerp(face.mouth.shape.A, Blendshape.getValue(VRMSchema.BlendShapePresetName.A) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.E, Vector.lerp(face.mouth.shape.E, Blendshape.getValue(VRMSchema.BlendShapePresetName.E) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.O, Vector.lerp(face.mouth.shape.O, Blendshape.getValue(VRMSchema.BlendShapePresetName.O) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.U, Vector.lerp(face.mouth.shape.U, Blendshape.getValue(VRMSchema.BlendShapePresetName.U) as number, 0.4));
	}

	if (result.ea && result.poseLandmarks) {
		const pose = Pose.solve(result.ea, result.poseLandmarks) as TPose;
		rigRotation(model, "Hips", pose.Hips.rotation, 0.7);
		const hipsPosition = model.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Hips)?.position;
		model.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Hips)?.position.lerp(new Vector3(hipsPosition?.x, hipsPosition?.y, -pose.Hips.position.z), 0.07)
		rigRotation(model, "Chest", pose.Spine, 0.25, .3);
		rigRotation(model, "Spine", pose.Spine, 0.45, .3);

		rigRotation(model, "RightUpperArm", pose.RightUpperArm, 1, .3);
		rigRotation(model, "RightLowerArm", pose.RightLowerArm, 1, .3);
		rigRotation(model, "LeftUpperArm", pose.LeftUpperArm, 1, .3);
		rigRotation(model, "LeftLowerArm", pose.LeftLowerArm, 1, .3);

		rigRotation(model, "LeftUpperLeg", pose.LeftUpperLeg, 1, .3);
		rigRotation(model, "LeftLowerLeg", pose.LeftLowerLeg, 1, .3);
		rigRotation(model, "RightUpperLeg", pose.RightUpperLeg, 1, .3);
		rigRotation(model, "RightLowerLeg", pose.RightLowerLeg, 1, .3);
	}
});

modelManager.on('modelLoaded', (model: VRM) => {
	captureCamera.start();
	mainScene.add(model.scene);
	const clock = new Clock();
	function render() {
		model.update(clock.getDelta());
		renderer.render(mainScene, orbitCamera);
		threeDisplay.update();
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
});