import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"

const getSupabaseClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
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

    return { data, error };
  } catch (error) {
    console.error('Error querying data:', error.message);
    return { data: [], error }
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache');

  const session = await getServerSession(req, res, authOptions)
  const email = session?.user?.email;
  const { prompt_id } = req.query;

  if (req.method === 'GET') {
    if (email) {
      const { data, error } = await queryPrompt(email, prompt_id);
      if (error) {
        console.error('Error querying data:', error.message);
        res.status(500).json({
          error: error.message
        })
      } else {
        const [first] = data;
        if (first) {
          res.status(200).json({
            prompt: first
          });
        } else {
          res.status(404);
        }
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}