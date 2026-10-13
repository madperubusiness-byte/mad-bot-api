const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const app = express();
const PORT = process.env.PORT || 10000;
const YAPE_NUM = "901 773 606";
const AUTH_FOLDER = "./auth_info";

const PRECIOS = {'1':11,'2':16,'3':24,'4':45};
const NOMBRES = {'1':'Lejía Galón','2':'Lejía 500ml','3':'Detergente','4':'Pack Completo'};

async function iniciar(){
  if(!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, {recursive:true});
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    if(u.qr) console.log('ESCANEA QR EN LOGS DE RENDER');
    if(u.connection==='open') console.log('BOT CONECTADO!');
    if(u.connection==='close'){
      const shouldReconnect = u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      if(shouldReconnect) iniciar();
    }
  });

  sock.ev.on('messages.upsert', async m=>{
    const msg = m.messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
    const jid = msg.key.remoteJid;

    if(texto.toLowerCase() === 'hola' || texto.toLowerCase() === 'menu'){
      let menu = `*MAD PERU - PRODUCTOS*\n\n`;
      for(let k in PRECIOS){ menu += `${k}. ${NOMBRES[k]} - S/${PRECIOS[k]}\n`; }
      menu += `\nEscribe el número del producto.\nYape: ${YAPE_NUM}`;
      await sock.sendMessage(jid, {text: menu});
    } else if(PRECIOS[texto]){
      await sock.sendMessage(jid, {text: `Elegiste: ${NOMBRES[texto]}\nPrecio: S/${PRECIOS[texto]}\n\nYapea a: ${YAPE_NUM}\nManda tu comprobante.`});
    }
  });
}

iniciar();
app.get('/', (req,res)=>res.send('MAD BOT ACTIVO'));
app.listen(PORT, ()=>console.log('Servidor en puerto '+PORT));
