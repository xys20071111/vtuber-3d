import './style.css';
import { View } from './PixiApp';

import './CaptureAndRig';
import ModelManager from './ModelManager';

const app:HTMLDivElement = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;

app.appendChild(View);

ModelManager.getInstance().loadModel('/static/model.vrm');

