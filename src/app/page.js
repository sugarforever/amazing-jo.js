'use client'

import { TextField, Button } from '@mui/material';
import { useState } from 'react';
import ReactJson from 'react-json-view'

export default function Home() {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipe, setRecipe] = useState(null);

  const handleSubmit = async (event) => {
    setRecipe(null);
    event.preventDefault();

    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openaiApiKey, recipeUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      setRecipe(data);
    } else {
      console.error('Error parsing recipe');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <div className="flex flex-col justify-center w-full max-w-[640px]">
        <h1 className="font-bold text-4xl mb-8">🥑 Amazing JO&lsquo;s Recipe</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField id="openai-api-key" label="OpenAI API Key" autoComplete="off" variant="outlined" type='password' value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} />
          <TextField id="recipe-url" label="URL of a Jamie Oliver Recipe" variant="outlined" value={recipeUrl} onChange={(e) => setRecipeUrl(e.target.value)} />
          <Button type="submit" variant="outlined">
            Parse Recipe
          </Button>
        </form>
        {recipe !== null && (
          <div class="mt-4">
            <ReactJson src={recipe} />
          </div>
        )}
      </div>
    </main>
  )
}
