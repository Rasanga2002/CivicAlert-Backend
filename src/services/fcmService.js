import admin from "firebase-admin";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

export const sendMessageNotification = async (sender, chatId, messageText, excludeUserId = null) => {
  try {
    if (!admin.apps.length) {
      console.warn('Firebase not initialized, skipping notification');
      return;
    }
    
    // Import models here to avoid circular dependencies
    const Chat = (await import("../models/Chat.js")).default;
    const chat = await Chat.findById(chatId).populate('participants', 'fcmToken');
    
    if (!chat) {
      console.error('Chat not found');
      return;
    }
    
    // Get FCM tokens of all participants except the sender
    const tokens = chat.participants
      .filter(user => user._id.toString() !== sender._id.toString() && 
                     (!excludeUserId || user._id.toString() !== excludeUserId.toString()) &&
                     user.fcmToken)
      .map(user => user.fcmToken);
    
    if (tokens.length === 0) {
      return;
    }
    
    const title = `New message from ${sender.name}`;
    const body = messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText;
    
    const data = {
      type: 'new_message',
      chatId: chatId.toString(),
      senderId: sender._id.toString(),
      click_action: 'FLUTTER_NOTIFICATION_CLICK'
    };
    
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
    
    console.log(`Notification sent to ${tokens.length} users`);
  } catch (error) {
    console.error('Error sending message notification:', error);
  }
};

export const sendChatNotification = async (chat, initiator) => {
  try {
    if (!admin.apps.length) {
      console.warn('Firebase not initialized, skipping notification');
      return;
    }
    
    // Get FCM tokens of all participants except the initiator
    const tokens = chat.participants
      .filter(user => user._id.toString() !== initiator._id.toString() && user.fcmToken)
      .map(user => user.fcmToken);
    
    if (tokens.length === 0) {
      return;
    }
    
    const title = 'New chat started';
    const body = `${initiator.name} started a new chat for an issue`;
    
    const data = {
      type: 'new_chat',
      chatId: chat._id.toString(),
      click_action: 'FLUTTER_NOTIFICATION_CLICK'
    };
    
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('Error sending chat notification:', error);
  }
};

export default admin;