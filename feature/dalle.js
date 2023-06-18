const { openai } = require("../providers/openai");
const { CreateImageRequestSizeEnum } = require("openai");
const { MessageMedia } = require("whatsapp-web.js");

const cli = require("../cli/ui");

const handleMessageDALLE = async (message, prompt) => {
  try {
    const start = Date.now();

    cli.print(`[DALL-E] Received prompt from ${message.from}: ${prompt}`);

    // Send the prompt to the API
    const response = await openai.createImage({
      prompt: prompt,
      n: 3,
      size: CreateImageRequestSizeEnum.SIZE_512X512,
      response_format: "b64_json",
    });

    const end = Date.now() - start;

    const base64 = response.data.data[0].b64_json;
    const image = new MessageMedia("image/jpeg", base64, "image.jpg");

    cli.print(`[DALL-E] Answer to ${message.from} | OpenAI request took ${end}ms`);

    message.reply(image);
  } catch (error) {
    console.error("An error occurred", error);
    message.reply("An error occurred, please contact the administrator. (" + error.message + ")");
  }
};

module.exports = { handleMessageDALLE };
