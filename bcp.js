const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { EditPhotoHandler } = require('./feature/edit_foto');
const { ChatAIHandler } = require('./feature/chat_ai');
const { handleMessageDALLE } = require('./feature/dalle');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'containers-us-west-82.railway.app',
  user: 'root',
  password: 'afWc8M0HnvNgVvUtJKoB',
  database: 'railway',
  port: 7372,
});

// Fonction de gestion des erreurs lors de la connexion à la base de données
connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connexion à la base de données réussie !');
});

// Fonction d'insertion d'un nouvel utilisateur
function insertNewUser(whatsappId, phoneNumber, sessionData, subscriptionType, subscriptionExpiry, trialStartTime, callback) {
  const sql = `
    INSERT INTO users (whatsapp_id, phone_number, session_data, subscription_type, subscription_expiry, trial_start_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql, [whatsappId, phoneNumber, sessionData, subscriptionType, subscriptionExpiry, trialStartTime], (error, results) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de l\'insertion du nouvel utilisateur :', error);
      callback(error);
    } else {
      console.log('Nouvel utilisateur inséré avec succès dans la base de données !');
      callback(null);
    }
  });
}

function getUserById(whatsappId, callback) {
  const sql = 'SELECT * FROM users WHERE whatsapp_id = ?';

  connection.query(sql, [whatsappId], (error, results) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de la récupération des informations de l\'utilisateur :', error);
      callback(error, null);
    } else {
      if (results.length > 0) {
        const user = results[0];
        console.log('Informations de l\'utilisateur récupérées avec succès :', user);
        callback(null, user);
      } else {
        console.log('Utilisateur introuvable dans la base de données.');
        callback(null, null);
      }
    }
  });
}

const client = new Client({
  authStrategy: new LocalAuth(),
  session: null
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async msg => {
  // Récupérer l'ID de l'utilisateur
  const userId = msg.from;

  getUserById(userId, (error, user) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de la récupération des informations de l\'utilisateur :', error);
      return;
    }

    if (!user) {
      // Utilisateur non trouvé dans la base de données, l'ajouter
      const newUser = {
        whatsappId: userId,
        phoneNumber: '',
        sessionData: '',
        subscriptionType: '',
        subscriptionExpiry: '',
        trialStartTime: ''
      };

      insertNewUser(
        newUser.whatsappId,
        newUser.phoneNumber,
        newUser.sessionData,
        newUser.subscriptionType,
        newUser.subscriptionExpiry,
        newUser.trialStartTime,
        (insertError) => {
          if (insertError) {
            console.error('Une erreur s\'est produite lors de l\'insertion du nouvel utilisateur :', insertError);
          } else {
            console.log('Nouvel utilisateur inséré avec succès dans la base de données !');
          }
        }
      );
    } else {
      console.log('Utilisateur déjà présent dans la base de données :', user);
    }
  });

  const text = msg.body.toLowerCase() || '';
  const media = msg.hasMedia ? msg.mediaData : null;

  // Vérifier si le message contient une photo
  if (media && media.type === 'image' && text.includes('#enhance')) {
    await handlePhotoEnhancement(msg);
    return;
  }

  // ... Autres conditions et fonctionnalités du bot ...

  // Reste du code du gestionnaire de message
});

client.on('message', async msg => {
  const text = msg.body.toLowerCase() || '';
  // Récupérer l'ID de l'utilisateur
  const userId = msg.from;

  console.log('ID de l\'utilisateur :', userId);

  // Autres traitements du message

  // Vérifier l'état
  if (text === 'salut') {
    msg.reply('Bonjour, comment allez-vous ?');
    return;
  } else if (text === 'quel est ton nom ?') {
    msg.reply('Mon nom est Clever, un bot intelligent.');
    return;
  } else if (text === 'quel est le nom de ton développeur ?') {
    msg.reply('Mon développeur s\'appelle Dekscrypt.');
    return;
  } else if (text === 'qui est ton développeur ?') {
    msg.reply('Mon développeur s\'appelle Dekscrypt.');
    return;
  } else if (text === 'qui t\'a développé ?') {
    msg.reply('Je suis développé par Dekscrypt, un développeur passionné.');
    return;
  } else if (text === 'qui est Dekscrypt ?') {
    msg.reply('Dekscrypt est un développeur talentueux et créatif. Il a une vaste expérience dans la programmation et il aime créer des solutions innovantes.');
    return;
  } else if (text.includes("#edit_bg/")) {
    await EditPhotoHandler(text, msg);
    return;
  } else if (text === 'générer une image') {
    msg.reply('Veuillez fournir une description pour générer une image.');
    return;
  } else if (text.startsWith('!dalle')) {
    const prompt = text.replace('!dalle', '').trim();
    await handleMessageDALLE(msg, prompt);
    return;
  }
  // Appeler handleReplicate comme méthode de l'objet importé
  else if (text.startsWith('#repli')) {
    const prompt = text.replace('#repli', '').trim();
    await handleReplicate(msg, prompt);
    return;
  }
  // Vérifier si le message est un message vocal
  if (msg.isVoiceMessage) {
    await handleVoiceRecognition(msg);
    return;
  }
  // Répondre automatiquement à tous les messages
  await ChatAIHandler(text, msg);
});

client.initialize();
