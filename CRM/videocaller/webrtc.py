
from aiortc import RTCPeerConnection, RTCSessionDescription
import json
    async def offer(request):
        pc = RTCPeerConnection()
        params = await request.json()
        username = params.get('username')
        offer = RTCSessionDescription(sdp=params['sdp'], type=params['type'])
        
        await pc.setRemoteDescription(offer)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        response_data = {
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type,
            'username': username
        }
        



