import { getSupabaseClient } from '@/lib/dbutil';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

const queryTokens = async (email) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_name', email);

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
      const { data, error } = await queryTokens(email);
      if (error) {
        console.error('Error querying data:', error.message);
        res.status(500).json({
          error: error.message
        })
      } else {
        if (data) {
          res.status(200).json({
            tokens: data
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
