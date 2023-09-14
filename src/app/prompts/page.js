'use client'

import { Button, Divider, Grid, Item, List, ListItemButton, ListItemText, TextField } from '@mui/material';
import { useEffect, useState, useMemo, Fragment } from 'react';

export default function Prompts({ session }) {
  const [prompts, setPrompts] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/prompts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const { prompts } = await response.json();
        console.log(prompts);
        setPrompts(prompts);
      } else {
        console.error('Error querying prompts');
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, name }),
    });

    if (response.ok) {
      const data = await response.json();
      const { prompt } = data;
      setPrompts([...prompts, prompt]);
    } else {
      console.error('Error creating a new prompt');
    }

    setPrompt('');
    setName('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <div className="flex flex-col justify-center w-full max-w-[640px]">
        <h1 className="font-bold text-4xl mb-8">🥑 Amazing Prompts</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            id="name"
            arie-label="Give your prompt a name"
            placeholder="Give your prompt a name"
            value={name}
            onChange={(e) => setName(e.target.value)} />
          <TextField
            id="prompt"
            arie-label="Type your prompt here"
            minRows={5}
            multiline
            placeholder="Type your prompt here"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)} />
          <Button type="submit" variant="outlined">
            Save
          </Button>
        </form>
        <div>
          <List sx={{ width: '100%' }}>
            {prompts.map((prompt, index) => (
              <Fragment key={index}>
                <ListItemButton alignItems="flex-start" component="a" href={`/prompts/${prompt.id}`}>
                  <ListItemText
                    primary={prompt.prompt}
                    secondary={prompt.created_at}
                  />
                </ListItemButton>
                {index < prompts.length - 1 && (
                  <Divider />
                )}
              </Fragment>
            ))}
          </List>
        </div>
      </div>
    </main>
  )
}
