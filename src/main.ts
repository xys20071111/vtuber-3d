import './style.css';
import { View } from './PixiApp';

import './CaptureAndRig';
import ModelManager from './ModelManager';
import backendEvent from './backendConnect';

const app:HTMLDivElement = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
const modelManager = ModelManager.getInstance()

app.appendChild(View);

ModelManager.getInstance().loadModel('/api/getModel3D');

backendEvent.on('reload-model', () => {
	console.log('重新加载模型')
	modelManager.cleanModel();
	modelManager.loadModel('/api/getModel3D');
})
