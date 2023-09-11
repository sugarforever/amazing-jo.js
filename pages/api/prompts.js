import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

const getSupabaseClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
}

const queryPrompts = async (email) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.from('prompts').select('*').eq('user_name', email);
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

  if (req.method === 'GET') {
    if (email) {
      const { data, error } = await queryPrompts(email);
      if (error) {
        console.error('Error querying data:', error.message);
        res.status(500)
      } else {
        res.status(200).json({
          prompts: data
        });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (req.method === 'POST') {
    const { prompt } = req.body;
    if (email) {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase.from('prompts').insert([
          { prompt, user_name: email },
        ]).select();
        
        if (error) {
          console.error('Error inserting data:', error.message);
          res.status(500)
        } else {
          res.status(200).json({
            prompt: data[0]
          });
        }
      } catch (error) {
        console.error('Error inserting data:', error.message);
        res.status(500)
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}