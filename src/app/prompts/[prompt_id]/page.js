'use client'

import { TextField, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useState, useMemo, Fragment } from 'react';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { HumanMessage } from "langchain/schema";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

const extractVariables = (template) => {
  const regex = /{{\s*([\w]+)\s*}}|{\s*([\w]+)\s*}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(template))) {
    if (match[1]) {
      // Double brackets indicate no variable
      continue;
    }
    matches.push(match[2]);
  }

  return matches;
}

export default function Prompt({ session, params }) {
  const { prompt_id } = params;
  const [prompt, setPrompt] = useState(null);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [inputVars, setInputVars] = useState({});
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const promptInputVars = useMemo(() => {
    const vars = prompt ? extractVariables(prompt.prompt) : [];
    const initialInputValues = {};
    vars.forEach((input) => {
      initialInputValues[input] = '';
    });
    setInputVars(initialInputValues);
    return vars;
  }, [prompt]);

  const handleInputChange = (e, inputName) => {
    const newValue = e.target.value;
    setInputVars((prevInputValues) => ({
      ...prevInputValues,
      [inputName]: newValue,
    }));
  };

  const ask = async (event) => {
    event.preventDefault();
    setAnswer(null);
    setLoading(true);

    const chat = new ChatOpenAI({
      temprature: 0,
      openAIApiKey: openaiApiKey,
      modelName: "gpt-3.5-turbo-16k"
    });

    const template = new PromptTemplate({
      template: prompt.prompt,
      inputVariables: Object.keys(inputVars)
    });

    const content = await template.format(inputVars);
    const response = await chat.call([new HumanMessage(content)]);
    setLoading(false);
    setAnswer(response?.content);
  };

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/api/prompts/${prompt_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const { prompt } = data;
        setPrompt(prompt)
      } else {
        console.error('Error creating a new prompt');
      }
    }

    fetchData();
  }, [prompt_id]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <div className="flex flex-col justify-center w-full max-w-[640px]">
        <h1 className="font-bold text-4xl mb-8">🥑 Amazing Prompt</h1>
        <ReactMarkdown className="mb-8">
          {prompt?.prompt}
        </ReactMarkdown>
        <form className="flex flex-col gap-4" onSubmit={ask}>
          <TextField
            id="openai-api-key"
            label="OpenAI API Key"
            minRows={1}
            type='password'
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
          />
          {promptInputVars.map((inputVar, index) => (
            <TextField
              key={index}
              label={inputVar}
              minRows={1}
              multiline
              value={inputVars[inputVar]}
              onChange={(e) => handleInputChange(e, inputVar)}
            />
          ))}
          <LoadingButton loading={loading} type="submit" variant="outlined">
            Ask
          </LoadingButton>
        </form>

        <div>
          <ReactMarkdown className="mt-4" rehypePlugins={rehypeHighlight}>
            {answer}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
