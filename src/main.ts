import './style.css';
import { View } from './PixiApp';

import { onResult } from './CaptureAndRig';
import ModelManager from './ModelManager';
import backendEvent from './backendConnect';
import { mainScene, orbitCamera } from './Scene';
import { Color } from 'three';
import { loader } from './Scene'

const app:HTMLDivElement = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement
const modelManager = ModelManager.getInstance()

app.appendChild(View);

ModelManager.getInstance().loadModel('/api/getModel3D');

backendEvent.on('reload-model', () => {
	console.log('重新加载模型')
	modelManager.cleanModel();
	modelManager.loadModel('/api/getModel3D');
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
backendEvent.on('set-new-background', (data: any) => {
	console.log(data)
	localStorage.setItem('background', JSON.stringify(data))
	if (data.type === 'color' || data.type === 'colour') {
		const color = data.data as string
		mainScene.background = new Color(parseInt(color.replace('#', ''), 16));
	} else if (data.type === 'img') {
		const texture = loader.load(data.data)
		mainScene.background = texture
	}
})

backendEvent.on('set-cam-pos', (data: any) => {
	console.log(data)
	localStorage.setItem('cameraPosition', JSON.stringify(data))
	for(const k in data) {
		switch(k) {
			case 'x':
				orbitCamera.position.x = data[k]
				break
			case 'y':
				orbitCamera.position.y = data[k]
				break
			case 'z':
				orbitCamera.position.z = data[k]
				break
			default:
				break
		}
	}
})

backendEvent.on('set-pose', (data: any) => {
	onResult(data)
})
