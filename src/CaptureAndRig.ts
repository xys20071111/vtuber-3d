import { Quaternion, Euler, Vector3, Clock } from "three";
import { TFace, TPose, THand, Vector, Utils, Face } from "kalidokit";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import ModelManager from "./ModelManager";
import { rigRotation } from "./utils";
import { mainScene, orbitCamera, renderer, threeDisplay } from "./Scene";

interface PoseData {
	face?: TFace
	pose?: TPose
	handL?: THand<'Left'>
	handR?: THand<'Right'>
}

const modelManager: ModelManager = ModelManager.getInstance();


export const onResult = (result: PoseData) => {
	const model = modelManager.getModel();
	if (!model) {
		return;
	}
	if (result.face) {
		const face = result.face
		const Blendshape = model.blendShapeProxy;
		const rotation = new Euler(face.head.x, face.head.y, face.head.z)
		model.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Neck)?.quaternion.slerp(new Quaternion().setFromEuler(rotation), 0.7);
		face.eye.l = Vector.lerp(Utils.clamp(1 - face.eye.l, 0, 1), Blendshape?.getValue(VRMSchema.BlendShapePresetName.Blink) as number, 0.7) as number;
		face.eye.r = Vector.lerp(Utils.clamp(1 - face.eye.r, 0, 1), Blendshape?.getValue(VRMSchema.BlendShapePresetName.Blink) as number, 0.7) as number;
		const eyeStable = Face.stabilizeBlink(face.eye, face.head.y)
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.BlinkL, eyeStable.l);
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.BlinkR, eyeStable.r);

		// Interpolate and set mouth blendshapes
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.I, Vector.lerp(face.mouth.shape.I, Blendshape.getValue(VRMSchema.BlendShapePresetName.I) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.A, Vector.lerp(face.mouth.shape.A, Blendshape.getValue(VRMSchema.BlendShapePresetName.A) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.E, Vector.lerp(face.mouth.shape.E, Blendshape.getValue(VRMSchema.BlendShapePresetName.E) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.O, Vector.lerp(face.mouth.shape.O, Blendshape.getValue(VRMSchema.BlendShapePresetName.O) as number, 0.4));
		Blendshape?.setValue(VRMSchema.BlendShapePresetName.U, Vector.lerp(face.mouth.shape.U, Blendshape.getValue(VRMSchema.BlendShapePresetName.U) as number, 0.4));
	}

	if (result.pose) {
		const pose = result.pose
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
	if (result.handL && result.pose) {
		const leftHand = result.handL;
		rigRotation(model, "LeftHand", {
			// Combine pose rotation Z and hand rotation X Y
			z: result.pose.LeftHand.z,
			y: leftHand.LeftWrist.y,
			x: leftHand.LeftWrist.x
		});
		rigRotation(model, "LeftRingProximal", leftHand.LeftRingProximal);
		rigRotation(model, "LeftRingIntermediate", leftHand.LeftRingIntermediate);
		rigRotation(model, "LeftRingDistal", leftHand.LeftRingDistal);
		rigRotation(model, "LeftIndexProximal", leftHand.LeftIndexProximal);
		rigRotation(model, "LeftIndexIntermediate", leftHand.LeftIndexIntermediate);
		rigRotation(model, "LeftIndexDistal", leftHand.LeftIndexDistal);
		rigRotation(model, "LeftMiddleProximal", leftHand.LeftMiddleProximal);
		rigRotation(model, "LeftMiddleIntermediate", leftHand.LeftMiddleIntermediate);
		rigRotation(model, "LeftMiddleDistal", leftHand.LeftMiddleDistal);
		rigRotation(model, "LeftThumbProximal", leftHand.LeftThumbProximal);
		rigRotation(model, "LeftThumbIntermediate", leftHand.LeftThumbIntermediate);
		rigRotation(model, "LeftThumbDistal", leftHand.LeftThumbDistal);
		rigRotation(model, "LeftLittleProximal", leftHand.LeftLittleProximal);
		rigRotation(model, "LeftLittleIntermediate", leftHand.LeftLittleIntermediate);
		rigRotation(model, "LeftLittleDistal", leftHand.LeftLittleDistal);
	}

	if(result.handR && result.pose) {
		const rightHand = result.handR;
		rigRotation(model, "RightHand", {
		// Combine Z axis from pose hand and X/Y axis from hand wrist rotation
			z: result.pose.RightHand.z,
			y: rightHand.RightWrist.y,
			x: rightHand.RightWrist.x
		});
		rigRotation(model, "RightRingProximal", rightHand.RightRingProximal);
		rigRotation(model, "RightRingIntermediate", rightHand.RightRingIntermediate);
		rigRotation(model, "RightRingDistal", rightHand.RightRingDistal);
		rigRotation(model, "RightIndexProximal", rightHand.RightIndexProximal);
		rigRotation(model, "RightIndexIntermediate",rightHand.RightIndexIntermediate);
		rigRotation(model, "RightIndexDistal", rightHand.RightIndexDistal);
		rigRotation(model, "RightMiddleProximal", rightHand.RightMiddleProximal);
		rigRotation(model, "RightMiddleIntermediate", rightHand.RightMiddleIntermediate);
		rigRotation(model, "RightMiddleDistal", rightHand.RightMiddleDistal);
		rigRotation(model, "RightThumbProximal", rightHand.RightThumbProximal);
		rigRotation(model, "RightThumbIntermediate", rightHand.RightThumbIntermediate);
		rigRotation(model, "RightThumbDistal", rightHand.RightThumbDistal);
		rigRotation(model, "RightLittleProximal", rightHand.RightLittleProximal);
		rigRotation(model, "RightLittleIntermediate", rightHand.RightLittleIntermediate);
		rigRotation(model, "RightLittleDistal", rightHand.RightLittleDistal);
	}
};

modelManager.on('modelLoaded', (model: VRM) => {
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