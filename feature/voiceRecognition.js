
// Gestionnaire d'événement pour les messages reçus
client.on('message', async msg => {
    const historiqueDiscussion = await getHistoriqueDiscussionFromDatabase(msg.from); // Récupérer l'historique de discussion de l'utilisateur
    const messageActuel = msg.body; // Récupérer le message actuel de l'utilisateur
    const response = await getOpenAIResponse(historiqueDiscussion, messageActuel); // Appeler l'API OpenAI pour obtenir la réponse
  
    // Envoyer la réponse à l'utilisateur
    msg.reply(response);
  });
  
  // Gestionnaire d'événement pour les messages reçus
    client.on('message', async msg => {
     const historiqueDiscussion = await getHistoriqueDiscussionFromDatabase(msg.from); // Récupérer l'historique de discussion de l'utilisateur
     const messageActuel = msg.body; // Récupérer le message actuel de l'utilisateur
  // Définir la variable 'numero' avec le numéro de téléphone de l'expéditeur
    const numero = msg.from;
  
  // Vérifier si le numéro est l'administrateur de test
    if (numero === '+2438196439316') { // Remplacez '123456789' par le numéro de l'administrateur de test
      // Effectuer les actions spécifiques pour l'administrateur de test
      console.log('C\'est l\'administrateur de test. Aucun abonnement n\'est requis.');
      return; // Ajouter un return ici pour éviter d'exécuter le reste du code pour l'administrateur de test
    }
  // Vérifier le statut de l'abonnement de l'utilisateur ici
    const isUserSubscribed = true; // Exemple : Utilisateur abonné (abonnement valide)
    
  });