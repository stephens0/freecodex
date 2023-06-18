const axios = require('axios');
const { API_KEY_OPEN_AI } = require('../config');

const ChatAIHandler = async (text, msg) => {
    const question = text.replace("#ask/", "");

    if (question.includes('nom de bot')) {
        return msg.reply("Mon nom est Clever.");
    }

    const response = await ChatGPTRequest(question);

    if (!response.success) {
        return msg.reply(response.message);
    }

    if (question.includes('nom de bot')) {
        return msg.reply("Mon nom est Clever.");
    } else if (question.includes('developpé')) {
        return msg.reply("Je suis développé par Dekscrypt.");
    } else if (question.includes('dekscrypt')) {
        return msg.reply("Dekscrypt est un développeur passionné avec une expertise dans divers domaines de la programmation. Il aime créer des solutions innovantes et est toujours à la recherche de nouveaux défis.");
    } else if (question.includes('nom développeur')) {
        return msg.reply("Le nom du développeur est Dekscrypt.");
    }

    return msg.reply(response.data);
}

const ChatGPTRequest = async (text) => {
    const result = {
        success: false,
        data: "Je ne sais pas",
        message: "",
    }

    return await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        data: {
            model: "text-davinci-003",
            prompt: text,
            max_tokens: 3000,
            temperature: 0
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Language": "in-ID",
            "Authorization": `Bearer ${API_KEY_OPEN_AI}`,
        },
    })
    .then((response) => {
        if (response.status == 200) {
            const { choices } = response.data;
            if (choices && choices.length) {
                result.success = true;
                result.data = choices[0].text;
            }
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
    ChatAIHandler
}
