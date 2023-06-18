const request = require('request');
const fs = require('fs');

const enhancePhoto = (url, msg) => {
  const token = '<YOUR_TOKEN>';
  const apiKey = '<YOUR_API_KEY>';

  const options = {
    method: 'POST',
    url: 'https://image.adobe.io/lrService/autoStraighten',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        href: url,
        storage: '<STORAGE_TYPE>',
      },
      outputs: [
        {
          href: '<SIGNED_POST_URL>',
          type: 'image/jpeg', // Spécifiez le type de sortie comme JPEG
          storage: '<STORAGE_TYPE>',
        },
      ],
    }),
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const jobId = JSON.parse(body)._links.self.href.split('/').pop();
    pollJobStatus(jobId, msg);
  });
};

const pollJobStatus = (jobId, msg) => {
  const token = '<YOUR_TOKEN>';
  const apiKey = '<YOUR_API_KEY>';

  const options = {
    method: 'GET',
    url: `https://image.adobe.io/lrService/status/${jobId}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': apiKey,
    },
  };

  const interval = setInterval(function () {
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      const status = JSON.parse(body).state;
      if (status === 'done') {
        const downloadUrl = JSON.parse(body)._links.outputs[0].href;
        clearInterval(interval);
        downloadEnhancedPhoto(downloadUrl, msg);
      } else if (status === 'error') {
        clearInterval(interval);
        console.log('Une erreur s\'est produite lors de l\'amélioration de la photo.');
      }
    });
  }, 2000); // Vérifiez l'état toutes les 2 secondes (vous pouvez ajuster l'intervalle selon vos besoins)
};

const downloadEnhancedPhoto = (url, msg) => {
  const downloadPath = './enhanced_photo.jpg';

  request(url).pipe(fs.createWriteStream(downloadPath)).on('close', function () {
    msg.reply({
      file: downloadPath, // Envoie la photo en tant que pièce jointe
      caption: 'Voici votre photo améliorée :',
    });
    fs.unlinkSync(downloadPath); // Supprime le fichier téléchargé après l'envoi
  });
};

// Utilisation de la fonction pour améliorer une photo et la renvoyer à l'utilisateur
enhancePhoto('<SIGNED_GET_URL>', msg);
