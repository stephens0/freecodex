const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { EditPhotoHandler } = require('./feature/edit_foto');
const { ChatAIHandler } = require('./feature/chat_ai');
const { handleMessageDALLE } = require('./feature/dalle');

const ytdl = require('ytdl-core'); // Importation de ytdl-core


const client = new Client({
  authStrategy: new LocalAuth(),
  session: null
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client est prêt !');
});
// Gestion de l'événement de réception de message
client.on('message', async (msg) => {
  const text = msg.body.toLowerCase() || '';
  const userId = msg.from;

  try {
    
    // Gérer les différents cas en fonction du texte du message
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
    } else if (text.startsWith('#img')) {
      const prompt = text.replace('#img', '').trim();
      await handleMessageDALLE(msg, prompt);
    } else if (text.startsWith('#repli')) {
      const prompt = text.replace('#repli', '').trim();
      await handleReplicate(msg, prompt);
    } else if (text === '#00') {
      msg.reply(
        'Menu Principal:\n' +
        '#01 Types de souscription\n' +
        '#02 Les différents avantages entre la souscription simple et ultra\n' +
        '#03 Souscription simple\n' +
        '#04 Souscription ultra\n' +
        '#05 Modes de paiement\n' +
        '#06 Prix des Souscriptions\n' +
        '#07 Comment utiliser Clever?\n'
      );
    } else if (text === '#01') {
      msg.reply(
        'les differents types de souscription:\n\n' +
        '-Souscription Simple .\n' +
        '- Souscription Ultra.\n'
      );
    } else if (text === '#02') {
      msg.reply(
        'Différents avantages entre la souscription simple et ultra:\n\n' +
        'Souscription simple:\n' +
        '- Possibilité de discuter uniquement avec Clever.\n\n' +
        'Souscription ultra:\n' +
        '- Possibilité de discuter avec Clever.\n' +
        '- Génération d\'images.\n' +
        '- Édition de l\'arrière-plan de vos photos.'
      );
    } else if (text === '#05') {
      msg.reply(
        'Différents modes de paiement:\n\n' +
        '- Paiement mobile : M-PESA, ORANGE, AFRIMONEY, AIRTELMONEY, MTN.\n' +
        '- Paiement par carte Visa et Mastercard.\n' +
        '- Paiement par Crypto.'
      );
    } else if (text === '#06') {
      msg.reply(
        'Différents prix de souscriptions:\n\n' +
        '- Souscription simple :5$ pour 30 jours\n' +
        '- Souscription Ultra : 7$ pour 30 jours.'
      );
    } else if (text === '#07') {
      msg.reply(
        'Utiliser Clever est vraiment très simple!\n\n' +
        'Il suffit juste de lui envoyer un message normal comme: comment rester en forme? il vous repondra en instantané.\n\n' +
        'Grâce à ses fonctionnalités Ultra, vous pouvez éditer vos photos en changeant leur arrière-plan et générer des images avec vos textes.\n\n' +
        'Pour éditer l\'arrière-plan de votre photo, envoyez simplement votre photo à Clever avec le message :\n' +
        '#edit_bg/white pour changer l\'arrière-plan en couleur blanche\n' +
        '#edit_bg/black pour changer l\'arrière-plan en couleur noire.\n\n' +
        'Pour générer des images avec Clever, envoyez un message commençant par #img.\n\n' +
        'Exemple: #img "un chat dans un champ de fleurs"'
      );
    } else {
      // Répondre automatiquement à tous les autres messages
      await ChatAIHandler(text, msg);
    }
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération de l'utilisateur :", error);
  }
});

client.initialize();
