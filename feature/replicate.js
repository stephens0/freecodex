const { REPLICATE_API_KEY } = require('../config');
const Replicate = require("replicate");
const { MessageMedia } = require("whatsapp-web.js");

const replicate = new Replicate({
  auth: REPLICATE_API_KEY,
});

const handleReplicate = async (message, prompt) => {
  try {
    const start = Date.now();

    console.log(`Received prompt from ${message.from}: ${prompt}`);

    const output = await replicate.run(
      "ai-forever/kandinsky-2:601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f",
      {
        input: {
          prompt: `# prior_cf_scale = 4\n# prior_steps = 5\n# width = 512\n# height = 512\n# batch_size = 1\n${prompt}`
        },
        response_format: "b64_json"
      }
    );

    const end = Date.now() - start;

    if (output.image && output.image.base64) {
      const base64 = output.image.base64;
      const image = new MessageMedia("image/png", base64, "image.png");

      console.log(`Answer to ${message.from} | Replicate request took ${end}ms`);

      message.reply(image);
    } else {
      console.log(`No image received from Replicate`);

      // Répondre avec un message approprié en cas d'absence d'image
      message.reply("Désolé, aucune image n'a été générée pour la requête spécifiée.");
    }
  } catch (error) {
    console.error("Une erreur s'est produite", error);
    message.reply("Une erreur s'est produite, veuillez contacter l'administrateur. (" + error.message + ")");
  }
};

module.exports = {
  handleReplicate: handleReplicate
};
