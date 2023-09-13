import { getSupabaseClient } from '@/lib/dbutil';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { HumanMessage } from "langchain/schema";

const queryByToken = async (token) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .limit(1);

    if (error) {
      console.error('Error querying tokens:', error.message);
      return null;
    }
    return data.length > 0 ? data[0].user_name : null;
  } catch (error) {
    console.error('Error querying data:', error.message);
    return null;
  }
}

const queryPrompt = async (email, prompt_id) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', prompt_id)
      .eq('user_name', email)
      .limit(1);

    if (error) {
      console.error('Error querying prompts:', error.message);
      return null;
    }
    return data.length > 0 ? data[0].prompt : null;
  } catch (error) {
    console.error('Error querying data:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache');

  const token = req.headers['x-auth'];
  const openaiApiKey = req.headers['openai-api-key'];
  const prompt_id = req.body.prompt;
  const inputVars = req.body.inputs;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const userName = await queryByToken(token);
  if (!userName) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const prompt = await queryPrompt(userName, prompt_id);

  if (!prompt) {
    res.status(404).json({ error: 'Prompt not found.' });
    return;
  }

  const chat = new ChatOpenAI({
    temprature: 0,
    openAIApiKey: openaiApiKey,
    modelName: "gpt-3.5-turbo-16k"
  });

  const template = new PromptTemplate({
    template: prompt,
    inputVariables: Object.keys(inputVars)
  });

  const content = await template.format(inputVars);
  const response = await chat.call([new HumanMessage(content)]);
  res.status(200).json({
    content: response?.content
  });
}
