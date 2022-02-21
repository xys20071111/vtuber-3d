import { EventEmitter } from "eventemitter3"

const backend = new WebSocket('ws://127.0.0.1:8008/control')
const backendEvent = new EventEmitter()

interface Message {
	cmd: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any
}

backend.onmessage = (msg: MessageEvent<string>) => {
	try {
		const data:Message = JSON.parse(msg.data)
		backendEvent.emit(data.cmd, data.data)
	} catch (e: unknown) {
		console.error(e)
	}
	
}

backend.onopen = () => {
	console.log('已连接到后端')
}
export default backendEvent;
