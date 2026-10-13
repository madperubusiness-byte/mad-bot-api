const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const app = express();
const PORT = process.env.PORT || 10000;
const YAPE_NUM = "901 773 606";
const AUTH_FOLDER = "./auth_info";

const PRECIOS = {'1':11,'2':16,'3':24,'4':16,'5':24,'6':18,'7':22,'8':18,'9':20};
const NOMBRES = {'1':'Lejía Galón','2':'LimpiaTodo','3':'Detergente','4':'Suavizante','5':'Cloro','6':'Ácido','7':'Pino','8':'Shampoo Carro','9':'Cera'};

async function iniciar(){
  if(!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, {recursive:true});
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    if(u.qr) console.log('ESCANEA QR EN LOGS');
    if(u.connection==='open') console.log('MAD BOT 915 CONECTADO!');
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0]; if(!m.message||m.key.fromMe) return;
    const jid=m.key.remoteJid;
    const txt=(m.message.conversation||m.message.extendedTextMessage?.text||'').trim();
    const lower=txt.toLowerCase();
    if(/[1-9]/.test(txt)){
      const n=txt.match(/[1-9]/)[0];
      await sock.sendMessage(jid,{text:`🧴 ${NOMBRES[n]} - S/${PRECIOS[n]}\nYapea al ${YAPE_NUM} y envía captura 📲`});
      return;
    }
    if(lower.includes('yape')||lower.includes('qr')||lower.includes('pago')){
      await sock.sendMessage(jid,{text:`Yapea 👉 ${YAPE_NUM} - Titular MAD PERU\nMonto según producto`});
      if(fs.existsSync(QR_FILE)){await sock.sendMessage(jid,{image: fs.readFileSync(QR_FILE), caption: `QR YAPE ${YAPE_NUM}`});}
      return;
    }
    await sock.sendMessage(jid,{text:`Hola! Soy Sofia de MAD PERU 🇵🇪\nElige 1 al 9 para ver productos:\n1-Lejía 11\n2-LimpiaTodo 16\n3-Detergente 24\n...escribe YAPE para pagar`});
  });
}

app.get('/',(req,res)=>res.send('MAD BOT 915 activo - Trujillo'));
app.listen(PORT,()=>{console.log(`MAD BOT en puerto ${PORT}`); iniciar();});
