import { VRM, VRMSchema } from "@pixiv/three-vrm";
import { Quaternion, Euler, Vector3 } from "three";

export function isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
  return key in object;
}

//From: https://glitch.com/edit/#!/kalidokit?path=script.js%3A20%3A35
const rigRotation = (
  model: VRM,
  name: string,
  rotation = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  let Part;
  if (isValidKey(name, VRMSchema.HumanoidBoneName)) {
    Part = model?.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[name]);
  }
  if (!Part) { return }
  
  let euler = new Euler(
    rotation.x * dampener,
    rotation.y * dampener,
    rotation.z * dampener
  );
  let quaternion = new Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};


const rigPosition = (
  model: VRM,
  name: string,
  position = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  let Part;
  if (isValidKey(name, VRMSchema.HumanoidBoneName)) {
    Part = model?.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[name]);
  }
  if (!Part) { return }
  let vector = new Vector3(
    position.x * dampener,
    position.y * dampener,
    position.z * dampener
  );
  Part.position.lerp(vector, lerpAmount); // interpolate
};

export { rigPosition, rigRotation };