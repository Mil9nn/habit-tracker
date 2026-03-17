import { OpenAI } from 'openai'

console.log("KEY:", process.env.OPENAI_API_KEY);

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
