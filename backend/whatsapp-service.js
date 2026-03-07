// whatsapp-service.js
// This file handles WhatsApp integration for LOCAL TESTING ONLY
// For production, use Meta Cloud API instead

import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

let client = null;
let isReady = false;

export const initWhatsAppClient = () => {
  if (client) return client;

  client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    console.log('\n========================================');
    console.log('📱 Scan this QR code with WhatsApp');
    console.log('========================================\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp Client is ready!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failure:', msg);
    isReady = false;
  });

  client.on('disconnected', (reason) => {
    console.warn('⚠️ Client was logged out:', reason);
    isReady = false;
  });

  client.initialize();
  return client;
};

export const sendWhatsAppMessage = async (phoneNumber, message) => {
  if (!isReady) {
    console.warn('⚠️ WhatsApp client not ready. Message will be logged only.');
    console.log(`[WhatsApp Message] To: ${phoneNumber}\nMessage: ${message}`);
    return { success: true, message: 'Logged (client not ready)' };
  }

  try {
    // Format phone number: ensure it's in international format without +
    const formattedNumber = phoneNumber.replace(/\D/g, '').slice(-10); // Last 10 digits
    const chatId = `91${formattedNumber}@c.us`; // India (91) - adjust for other countries

    await client.sendMessage(chatId, message);
    console.log(`✅ Message sent to ${phoneNumber}`);
    return { success: true, message: 'Message sent' };
  } catch (error) {
    console.error(`❌ Error sending message to ${phoneNumber}:`, error);
    return { success: false, error: error.message };
  }
};

export const getWhatsAppStatus = () => {
  return {
    isReady,
    message: isReady
      ? '✅ WhatsApp connected'
      : '⏳ Waiting for authentication. Scan the QR code.',
  };
};
