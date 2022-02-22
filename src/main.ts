import './style.css';
import { View } from './PixiApp';

import './CaptureAndRig';
import ModelManager from './ModelManager';
import backendEvent from './backendConnect';
import { mainScene } from './Scene';
import { Color, Texture, TextureLoader } from 'three';

const app:HTMLDivElement = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement
const modelManager = ModelManager.getInstance()
const loader = new TextureLoader()

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
	if (data.type === 'color' || data.type === 'colour') {
		const color = data.data as string
		mainScene.background = new Color(parseInt(color.replace('#', ''), 16));
	} else if (data.type === 'img') {
		const texture = loader.load(data.data)
		mainScene.background = texture
	}
})
