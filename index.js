const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const app = express();
const PORT = process.env.PORT || 3000;
const YAPE_NUM = "901 773 606";
const QR_FILE = "./IMG-20261012-WA0299.jpg";
const PRECIOS = {'1':11,'2':16,'3':24,'4':16,'5':25,'6':25,'7':30,'8':4,'9':4};
const NOMBRES = {'1':'Lejía Galón','2':'LimpiaTodo Gal','3':'Sarrox','4':'Pino Gal','5':'Jabón Gal','6':'Detergente Gal','7':'Suavizante Gal','8':'Limpia 1L','9':'Pino 1L'};
async function iniciar(){
 const { state, saveCreds } = await useMultiFileAuthState('auth_mad');
 const sock = makeWASocket({ auth: state, logger: P({level:'silent'}) });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{ if(u.connection==='open') console.log('MAD 915 CONECTADO'); });
 sock.ev.on('messages.upsert', async ({messages})=>{
  const m=messages[0]; if(!m.message||m.key.fromMe) return;
  const jid=m.key.remoteJid;
  const txt=(m.message.conversation||m.message.extendedTextMessage?.text||'').trim();
  const lower=txt.toLowerCase();
  if(/[1-9]/.test(txt)){
   const n=txt.match(/[1-9]/)[0];
   await sock.sendMessage(jid,{text:`🧹 ${NOMBRES[n]} - S/${PRECIOS[n]}\nMándame Nombre y Distrito. Ej: Juan - Florencia\nTotal c/envío S/${PRECIOS[n]+10}`});
   return;
  }
  if(lower.includes('yape')||lower.includes('qr')||lower.includes('pagar')||txt.includes('-')){
   await sock.sendMessage(jid,{text:`Yapea 👉 ${YAPE_NUM}\nTitular: MAD PERU\nMándame captura luego`});
   if(fs.existsSync(QR_FILE)){await sock.sendMessage(jid,{image:fs.readFileSync(QR_FILE),caption:`QR YAPE OFICIAL - ${YAPE_NUM}`});}
   return;
  }
  await sock.sendMessage(jid,{text:`Hola! Soy Soluciano MAD PERU Trujillo 🧹\n1 Lejía S/11\n2 LimpiaTodo Gal S/16\n3 Sarrox S/24\n4 Pino Gal S/16\n5 Jabón S/25\n6 Detergente S/25\n7 Suavizante S/30\n8 Limpia 1L S/4\n9 Pino 1L S/4\nEscribe el número`});
 });
}
app.get('/',(req,res)=>res.send('MAD BOT 915 activo - YAPE 901'));
app.listen(PORT,()=>{iniciar();});
