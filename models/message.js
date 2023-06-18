const mongoose = require('mongoose');

// Définir le schéma du message
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Créer le modèle Message basé sur le schéma
const Message = mongoose.model('Message', messageSchema);

// Se connecter à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/forever', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Ici, vous pouvez ajouter le code pour démarrer le serveur ou l'application une fois connecté à la base de données
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Exemple d'utilisation du modèle Message
const newMessage = new Message({
  sender: 'John',
  content: 'Hello, how are you?',
});

newMessage.save()
  .then(() => {
    console.log('Message saved successfully');
  })
  .catch((error) => {
    console.error('Error saving message:', error);
  });
