 const express=require('express');
const {default:makeWASocket,useMultiFileAuthState}=require('@whiskeysockets/baileys');
const qrcode=require('qrcode');
const P=require('pino');
const app=express();
const PORT=process.env.PORT||10000;
let qr=null,ok=false;
async function start(){
const {state,saveCreds}=await useMultiFileAuthState('./auth');
const sock=makeWASocket({auth:state,logger:P({level:'silent'}),browser:['MAD','Chrome','1.0']});
sock.ev.on('connection.update',async u=>{
if(u.qr){qr=await qrcode.toDataURL(u.qr);console.log('QR OK');}
if(u.connection==='open'){ok=true;qr=null;console.log('CONECTADO');}
if(u.connection==='close'){ok=false;setTimeout(start,3000);}
});
sock.ev.on('creds.update',saveCreds);
}
start();
app.get('/',(r,s)=>s.send('MAD LIVE'));
app.get('/qr',(r,s)=>{
if(ok) return s.send('<h1>✅ CONECTADO</h1>');
if(qr) return s.send(`<center><img src="${qr}" style="width:320px"><h2>Escanea con WhatsApp</h2></center>`);
s.send('Generando QR...<script>setTimeout(()=>location.reload(),3000)</script>');
});
app.listen(PORT,()=>console.log('LIVE '+PORT));
