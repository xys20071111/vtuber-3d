import './style.css';
import { View } from './PixiApp';

import './CaptureAndRig';
import ModelManager from './ModelManager';
import backendEvent from './backendConnect';
import { mainScene } from './Scene';
import { Color, Texture } from 'three';

const app:HTMLDivElement = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
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
	if (data.type === 'color' || data.type === 'colour') {
		const color = data.data as string
		mainScene.background = new Color(parseInt(color.replace('#', ''), 16));
	} else if (data.type === 'img') {
		const image = new HTMLImageElement();
		image.src = data.data as string
		const texture = new Texture(image)
		mainScene.background = texture
	}
})
