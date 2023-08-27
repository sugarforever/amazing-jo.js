import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { HumanMessage } from "langchain/schema";
import { JSDOM } from "jsdom";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    name: z.string().describe("The name of the recipe"),
    ingredients: z
      .array(z.object({
        name: z.string().describe("The name of the ingredient"),
        quantity: z.string().describe("The specific unit of measurement corresponding to the quantity, such as grams, ounces, liters, etc."),
        unit: z.string().describe("The amount of the ingredient required for the recipe. This can be represented using various units such as grams, cups, teaspoons, etc."),
      }))
      .describe("The list of ingredients for the recipe."),
  })
);

const formatInstructions = parser.getFormatInstructions();
const prompt = new PromptTemplate({
  template: "Extract the recipe ingredients from the following HTML markup:\n{html}.\n{format_instructions}\n",
  inputVariables: ["html"],
  partialVariables: { format_instructions: formatInstructions },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const openaiApiKey = req.body.openaiApiKey;
    const recipeUrl = req.body.recipeUrl;
    
    console.log(`openaiApiKey: ${openaiApiKey}`);
    console.log(`recipeUrl: ${recipeUrl}`);
    
    const recipeResponse = await fetch(recipeUrl);
    const htmlString = await recipeResponse.text();
    const { document } = (new JSDOM(htmlString)).window;

    const elementById = document.getElementById('recipe-single');
    const html = elementById.innerHTML;

    const chat = new ChatOpenAI({
      temprature: 0,
      openAIApiKey: openaiApiKey,
      modelName: "gpt-3.5-turbo-16k"
    });

    const content = await prompt.format({ html: html });
    const response = await chat.call([ new HumanMessage(content) ]);
    
    const answer = await parser.parse(response.content);
    res.status(200).json(answer);
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}