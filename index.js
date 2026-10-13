 const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 10000;
const YAPE_NUM = "901 773 606";
const AUTH_FOLDER = "./auth_info";

const PRECIOS = {'1':11,'2':16,'3':24};
const NOMBRES = {'1':'Lejía Galón','2':'Lejía 2L','3':'Lejía 5L'};

let qrCodeData = null;
let sockGlobal = null;

async function iniciar(){
    if(!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, {recursive:true});
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const sock = makeWASocket({ auth: state, logger: P({level: 'silent'}) });
    sockGlobal = sock;
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (u)=>{
        const { connection, lastDisconnect, qr } = u;
        if(qr){
            qrCodeData = await qrcode.toDataURL(qr);
            console.log('QR GENERADO PARA SOLUCIANO');
        }
        if(connection === 'open'){
            console.log('BOT SOLUCIANO CONECTADO!');
            qrCodeData = null;
        }
        if(connection === 'close'){
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect) iniciar();
        }
        if(u.qr) console.log('ESCANEA QR en /qr');
    });
}

app.get('/', (req,res)=>{
    res.json({status:"MAD PERU BOT API ACTIVO", bot:"Soluciano", yape: YAPE_NUM, conectado: !!qrCodeData ? false : true });
});

app.get('/qr', (req,res)=>{
    if(!qrCodeData) return res.send('<h1 style="text-align:center">Generando QR Soluciano... refresca en 3 seg</h1><script>setTimeout(()=>location.reload(),3000)</script>');
    res.send(`<div style="text-align:center;margin-top:30px"><h1>BOT SOLUCIANO - Escanea</h1><img src="${qrCodeData}" style="width:320px;border:10px solid #000"><p>Yape: ${YAPE_NUM}</p><button onclick="location.reload()" style="padding:10px">Refrescar</button></div>`);
});

app.listen(PORT, ()=>{ console.log('Server en puerto '+PORT); iniciar(); });
