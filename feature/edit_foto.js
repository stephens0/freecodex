const axios = require('axios');
const { API_KEY_RM_BG } = require('../config');

const EditPhotoHandler = async (text, msg) => {
    const cmd = text.split('/'); // Divise le texte en commandes
    if (cmd.length < 2) {
        return msg.reply('Format incorrect. Tapez *edit_bg/couleur*');
    }

    if (msg.hasMedia) {
        if (msg.type != 'image') {
            return msg.reply('Seules les images peuvent être modifiées.');
        }

        msg.reply('Traitement en cours, veuillez patienter un instant.');

        const media = await msg.downloadMedia();

        if (media) {
            const color = cmd[1];
            const newPhoto = await EditPhotoRequest(media.data, color);

            if (!newPhoto.success) {
                return msg.reply('Une erreur s\'est produite.');
            }

            const chat = await msg.getChat();
            media.data = newPhoto.base64;
            chat.sendMessage(media, { caption: 'Voici le résultat.' });
        }
    }
}

const EditPhotoRequest = async (base64, bg_color) => {

    const result = {
        success: false,
        base64: null,
        message: "",
    }

    return await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: {
            image_file_b64: base64,
            bg_color: bg_color
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": API_KEY_RM_BG,
        },
    })
        .then((response) => {
            if (response.status == 200) {
                result.success = true;
                result.base64 = response.data.data.result_b64;
            } else {
                result.message = "Réponse échouée";
            }

            return result;
        })
        .catch((error) => {
            result.message = "Erreur : " + error.message;
            return result;
        });
}


module.exports = {
    EditPhotoHandler
}
