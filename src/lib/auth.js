import { getSupabaseClient } from '@/lib/dbutil';

const validate = async (token) => {
  if (!token) {
    return null;
  }

  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .limit(1);

    if (error) {
      console.error('Error querying data:', error.message);
      return null;
    }
    return data.length > 0 ? data[0].user_name : null;
  } catch (error) {
    console.error('Error querying data:', error.message);
    return null;
  }
}

export {
  validate
}
