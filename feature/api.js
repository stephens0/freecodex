// api.js
async function query(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/prompthero/openjourney-lora",
      {
        headers: { Authorization: "Bearer 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" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    return result;
  }
  
  module.exports = { query };
  