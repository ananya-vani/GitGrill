const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const { getGitHubRESTData } = require("./githubREST");
const { getGitHubGraphData } = require("./githubGraphQL");
const { analyzeProfile } = require("./profileAnalyzer");
const { buildPrompt } = require("./promptBuilder");
const { incrementGrills } = require("./supabase");

const app = express();

app.disable("x-powered-by");

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const { getTotalGrills } = require("./supabase");

app.get("/grills", async (req, res) => {
  try {
    const totalGrills = await getTotalGrills();
    res.json({ totalGrills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ totalGrills: 0 });
  }
});
app.post("/roast", async (req, res) => {
  try {
    const username = req.body.username?.trim();

    if (!username) {
      return res.status(400).json({
        error: "Username is required.",
      });
    }

    const restData = await getGitHubRESTData(username);
    const graphData = await getGitHubGraphData(username);

    const profile = analyzeProfile(restData, graphData);

    const messages = buildPrompt(profile);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 1,
      max_completion_tokens: 450,
    });

    const roast =
      response.choices?.[0]?.message?.content ??
      "GitGrill couldn't roast this profile.";

    const totalGrills = await incrementGrills();

    console.log("🔥 Total Grills:", totalGrills);

    res.json({
      roast,
      totalGrills,
    });
  } catch (error) {
    console.error("Roast Error:", error.message);

    res.status(500).json({
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong.",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`GitGrill running on http://localhost:${PORT}`);
});
