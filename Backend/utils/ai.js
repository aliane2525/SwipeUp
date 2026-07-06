const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateReply(messages) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a friendly dating assistant. Help users reply in short, natural, flirty messages.",
      },
      ...messages,
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { generateReply };