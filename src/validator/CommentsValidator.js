import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.GOGGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
async function checkAbusiveComment(comment) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "I will provide you a sentence, and you have to respond with 1 if it contains abusive words or meaning, otherwise 0.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Okay, I understand. I will respond with 1 if the sentence is abusive and 0 if it is not abusive.",
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(comment);

  return result.response.text().trim();
}

const cleanText = (text) => {
  return text.trim().replace(/\s+/g, " ");
};

export const checkComments = async (ctx) => {
  let { comment } = ctx.request.body;
if(!comment|| comment.trim()===""){
  return{message:"comment", message:"write a commnet to update"}
}
  comment = cleanText(comment);
  const response = parseInt(await checkAbusiveComment(comment));
  if (response === 1) {
    return {
      field: "comments",
      message: "you comment is against the moral guidelines",
    };
  }
  ctx.state.commentData = { ...(ctx.state.commentData || {}), comment };
  return null;
};
