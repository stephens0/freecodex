const { Configuration, OpenAIApi } = require("openai");
const config = require("../config");

// OpenAI Client (DALL-E)
const openai = new OpenAIApi(
  new Configuration({
    apiKey: config.API_KEY_OPEN_AI,
  })
);

module.exports = { openai };
