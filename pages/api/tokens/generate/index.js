import { getSupabaseClient } from '@/lib/dbutil';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache');

  const session = await getServerSession(req, res, authOptions)
  const email = session?.user?.email;

  if (req.method === 'POST') {
    if (email) {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('tokens')
          .upsert(
            [
              {
                user_name: email,
                token: uuidv4()
              },
            ],
            { onConflict: ["user_name"] }
          )
          .select();

        if (error) {
          console.error('Error inserting data:', error.message);
          res.status(500)
        } else {
          res.status(200).json({
            token: data[0]
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
