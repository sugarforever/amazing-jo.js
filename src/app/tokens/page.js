'use client'

import { Button, Divider, Grid, Item, List, ListItemButton, ListItemText, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useState, useMemo, Fragment } from 'react';

export default function Prompts({ session }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/tokens', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const { tokens } = await response.json();
        const [first] = tokens;
        if (first)
          setToken(first.token);
      } else {
        console.error('Error querying tokens');
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch('/api/tokens/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      const { token } = data;
      setToken(token.token);
    } else {
      console.error('Error generating a new token');
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <div className="flex flex-col justify-center w-full max-w-[640px]">
        <h1 className="font-bold text-4xl mb-8">🔑 API Tokens</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            id="access-token"
            arie-label="Your Access Token"
            size='small'
            value={token} />
          <LoadingButton loading={loading} type="submit" variant="outlined">
            Generate
          </LoadingButton>
        </form>
      </div>
    </main>
  )
}
