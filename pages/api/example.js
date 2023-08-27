export default function handler(req, res) {
  const openaiApiKey = req.body.openaiApiKey;
  const recipeUrl = req.body.recipeUrl;
  res.status(200).json({
    openaiApiKey,
    recipeUrl
  });
}