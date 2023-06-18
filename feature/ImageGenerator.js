const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { EditPhotoHandler } = require('./feature/edit_foto');
const { ChatAIHandler } = require('./feature/chat_ai');
const { handleMessageDALLE } = require('./feature/dalle');
const { handleUserSubscription } = require('./feature/subscriptions');
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

// Fonction de création de la table 'utilisateurs'
function createUtilisateursTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id VARCHAR(20) PRIMARY KEY,
      subscription_type ENUM('simple', 'ultra') NOT NULL,
      subscription_expiry TIMESTAMP NOT NULL,
      trial_start_time TIMESTAMP NOT NULL
    )
  `;

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de la création de la table utilisateurs :', error);
    } else {
      console.log('La table utilisateurs a été créée avec succès dans la base de données !');
    }
  });
}

createUtilisateursTable();

// Fonction d'insertion d'un nouvel utilisateur
function insertNewUser(id) {
  const subscriptionType = 'trial';
  const trialStartTime = new Date();
  const trialEndTime = new Date(trialStartTime.getTime() + (60 * 60 * 1000));
  const subscriptionExpiry = trialEndTime.toISOString().split('T')[0];

  const sql = `
    INSERT INTO utilisateurs (id, subscription_type, subscription_expiry, trial_start_time)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(sql, [id, subscriptionType, subscriptionExpiry, trialStartTime], (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.error('L\'utilisateur existe déjà dans la base de données !');
      } else {
        console.error('Une erreur s\'est produite lors de l\'insertion du nouvel utilisateur :', error);
      }
    } else {
      console.log('Nouvel utilisateur inséré avec succès dans la base de données !');

      setTimeout(() => {
        updateSubscriptionToPaid(id);
      }, 1 * 60 * 60 * 1000);
    }
  });
}

// Fonction de vérification du statut d'abonnement de l'utilisateur
function checkSubscriptionStatus(userId) {
  const sql = `
    SELECT subscription_type, subscription_expiry, trial_start_time
    FROM utilisateurs
    WHERE id = ?
  `;

  connection.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de la vérification du statut d\'abonnement de l\'utilisateur :', error);
    } else {
      if (results.length === 0) {
        console.log('L\'utilisateur n\'existe pas dans la base de données. Ajout en tant que nouvel utilisateur...');
        insertNewUser(userId);
      } else {
        const { subscription_type, subscription_expiry, trial_start_time } = results[0];
        const subscriptionType = subscription_type === 'ultra' ? 'ultra' : 'simple';
        const trialStartTime = new Date(trial_start_time);
        const trialEndTime = new Date(trialStartTime.getTime() + (60 * 60 * 1000));
        const subscriptionExpiry = new Date(subscription_expiry);

        handleUserSubscription(userId, subscriptionType, trialStartTime, trialEndTime, subscriptionExpiry);
      }
    }
  });
}

// Fonction de mise à jour de l'abonnement de l'utilisateur vers payant
function updateSubscriptionToPaid(userId) {
  const sql = `
    UPDATE utilisateurs
    SET subscription_type = 'ultra'
    WHERE id = ?
  `;

  connection.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de la mise à jour de l\'abonnement de l\'utilisateur :', error);
    } else {
      console.log('Abonnement de l\'utilisateur mis à jour avec succès vers la version payante !');
    }
  });
}

const SESSION_FILE_PATH = './session.json';

let sessionData;
try {
  sessionData = require(SESSION_FILE_PATH);
} catch (err) {
  sessionData = null;
}

const client = new Client({
  session: sessionData,
  authTimeoutMs: 5 * 60 * 1000,
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// Fonction de sauvegarde de la session
function saveSession() {
  if (sessionData) {
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessionData), function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
}

// Evénement 'auth_failure' : La session WhatsApp a expiré ou est invalide
client.on('auth_failure', () => {
  console.error('Erreur d\'authentification, veuillez vérifier votre QR code et réessayer.');
});

// Evénement 'ready' : Le client WhatsApp est prêt
client.on('ready', () => {
  console.log('Client is ready!');
  saveSession();

  // Vérification du statut d'abonnement de l'utilisateur
  checkSubscriptionStatus(client.info.wid.user);
});

// Evénement 'qr' : Le QR code est prêt pour l'authentification
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  // Enregistrement du numéro WhatsApp ici
  savePhoneNumberToDatabase(qr);
});

// Evénement 'authenticated' : L'authentification est réussie
client.on('authenticated', session => {
  console.log('Authenticated!');
  sessionData = session;
  saveSession();
});

// Evénement 'message' : Réception d'un message
client.on('message', async msg => {
  const text = msg.body.toLowerCase() || '';

  if (text === 'salut') {
    msg.reply('Bonjour, comment allez-vous ?');
  } else if (text === 'quel est ton nom ?') {
    msg.reply('Mon nom est Clever, un bot intelligent.');
  } else if (text === 'quel est le nom de ton développeur ?') {
    msg.reply('Mon développeur s\'appelle Dekscrypt.');
  } else if (text === 'qui est ton développeur ?') {
    msg.reply('Mon développeur s\'appelle Dekscrypt.');
  } else if (text === 'qui t\'a développé ?') {
    msg.reply('Je suis développé par Dekscrypt, un développeur passionné.');
  } else if (text === 'qui est Dekscrypt ?') {
    msg.reply('Dekscrypt est un développeur talentueux et créatif. Il a une vaste expérience dans la programmation et il aime créer des solutions innovantes.');
  } else if (text.includes("#edit_bg/")) {
    await EditPhotoHandler(text, msg);
  } else if (text === 'générer une image') {
    msg.reply('Veuillez fournir une description pour générer une image.');
  } else if (text.startsWith('!dalle')) {
    const prompt = text.replace('!dalle', '').trim();
    await handleMessageDALLE(msg, prompt);
  } else {
    await ChatAIHandler(text, msg);
  }
});

client.initialize();

