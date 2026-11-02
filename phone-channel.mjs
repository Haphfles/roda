export const validPair=token=>typeof token==='string'&&/^[a-f0-9]{32}$/.test(token);
export const randomPair=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
export async function phoneConfig(){for(const path of ['./shared-config.json','./Supabase/connection.json']){const r=await fetch(path,{signal:AbortSignal.timeout(10000)});if(r.ok){const c=await r.json();if(c.url&&c.publishableKey)return c;}}throw Error('Phone connection settings are missing.');}
export class PhoneChannel{
 constructor(config,token,{message=()=>{},status=()=>{}}={}){if(!validPair(token))throw Error('Invalid pairing link');this.config=config;this.topic='realtime:roda-pad-'+token;this.message=message;this.status=status;this.ref=0;this.attempts=0;this.closed=false;this.connect();}
 connect(){if(this.closed)return;this.ready=false;this.status('connecting');const url=new URL(this.config.url);url.protocol='wss:';url.pathname='/realtime/v1/websocket';url.search=new URLSearchParams({apikey:this.config.publishableKey,vsn:'1.0.0'});const ws=this.ws=new WebSocket(url);this.timeout=setTimeout(()=>ws.close(),10000);
  ws.onopen=()=>{this.join=String(++this.ref);this.sendRaw('phx_join',{config:{broadcast:{ack:false,self:false},presence:{enabled:false},private:false}},this.topic,this.join);this.heartbeat=setInterval(()=>this.sendRaw('heartbeat',{},'phoenix'),25000);};
  ws.onmessage=e=>{if(typeof e.data!=='string'||e.data.length>12000)return;let m;try{m=JSON.parse(e.data);}catch{return;}if(m.topic===this.topic&&m.event==='phx_reply'&&m.ref===this.join){clearTimeout(this.timeout);if(m.payload?.status==='ok'){this.ready=true;this.attempts=0;this.status('ready');}else{this.status('error','Pairing is unavailable. Check Supabase Realtime public channels.');this.close();}}else if(m.topic===this.topic&&m.event==='broadcast'&&m.payload?.event==='pad')this.message(m.payload.payload);else if(m.event==='phx_error'||m.event==='phx_close')ws.close();};
  ws.onerror=()=>{};ws.onclose=()=>{clearTimeout(this.timeout);clearInterval(this.heartbeat);this.ready=false;if(this.closed)return;this.status('disconnected');if(this.attempts++<5)this.retry=setTimeout(()=>this.connect(),Math.min(10000,1000*2**(this.attempts-1)));else this.status('error','Connection failed. Reopen Phone controller to retry.');};
 }
 sendRaw(event,payload,topic=this.topic,ref=String(++this.ref)){if(this.ws?.readyState!==1||this.ws.bufferedAmount>16000)return false;this.ws.send(JSON.stringify({topic,event,payload,ref,join_ref:topic==='phoenix'?null:this.join}));return true;}
 send(payload){return this.ready&&this.sendRaw('broadcast',{type:'broadcast',event:'pad',payload});}
 close(){this.closed=true;this.ready=false;clearInterval(this.heartbeat);clearTimeout(this.timeout);clearTimeout(this.retry);this.ws?.close();}
}
// Ignore stale, repeated, foreign and malformed inputs; a missing heartbeat stops movement.
export class PhoneInput{
 constructor(){this.peer=null;this.seq=-1;this.last=0;this.vector={x:0,z:0};this.lastAction=-Infinity;}
 receive(m,now,active,allowed){if(!m||!validPair(m.client))return null;if(m.type==='hello'){if(!this.peer)this.peer=m.client;return m.client===this.peer?'hello':null;}if(m.client!==this.peer||!Number.isSafeInteger(m.seq)||m.seq<=this.seq)return null;
  this.seq=m.seq;this.last=now;
  if(m.type==='input'){if(!Number.isFinite(m.x)||!Number.isFinite(m.z)||!active){this.stop();return null;}const n=Math.max(1,Math.hypot(m.x,m.z));this.vector={x:m.x/n,z:m.z/n};}
  if(m.type==='pause'&&now-this.lastAction>=300){this.lastAction=now;return 'pause';}
  if(m.type==='action'&&active&&allowed.includes(m.key)&&now-this.lastAction>=60){this.lastAction=now;return m.key;}return null;
 }
 stop(){this.vector={x:0,z:0};}
 read(now,active){if(!active||now-this.last>350)this.stop();return this.vector;}
}
