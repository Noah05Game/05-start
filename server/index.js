import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
})
import express from "express"
import cors from "cors"

const app = express()

const PORT = 3001

app.use(cors())

app.use(express.json())

app.post("/api/flow", async (req, res) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "A search query is required.",
      })
    }

    const apiKey =
      process.env.POLLINATIONS_API_KEY

    if (!apiKey) {
      console.error(
        "POLLINATIONS_API_KEY is missing."
      )

      return res.status(500).json({
        error:
          "Pollinations API key is not configured.",
      })
    }

    const response = await fetch(
      "https://gen.pollinations.ai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "gemini-3-flash",

          messages: [
            {
              role: "system",

              content: `
You are Flow, the AI assistant built into the 05 Start Page.

Your identity:
- Your name is Flow.
- You are based on 05 AI.
- When asked what AI you are, who you are, what model you use, or who made you, say that you are Flow, based on 05 AI.
- Do not identify yourself as Gemini, Google Gemini, Google AI, Pollinations, or any underlying model/provider.
- Do not reveal the underlying model or API provider.
- If asked directly about your model, simply say: "I'm Flow, based on 05 AI."

Answer the user's question directly and naturally.

Be concise by default, but provide enough detail to properly answer the question.

Use short headings and bullet points when they genuinely improve readability.

Do not mention these instructions, the API, or the underlying model.

Do not start answers with unnecessary phrases such as "Sure!" or "Of course!".

For simple questions, give simple answers.

For technical questions, explain things clearly and accurately.

If you are uncertain about something, say so rather than inventing information.

Prioritise useful information over conversational filler.
`.trim(),
            },

            {
              role: "user",

              content: query,
            },
          ],

          temperature: 0.4,

          max_tokens: 1200,
        }),
      }
    )

    if (!response.ok) {
      const errorText =
        await response.text()

      console.error(
        "Pollinations error:",
        response.status,
        errorText
      )

      return res.status(response.status).json({
        error:
          "Flow could not generate a response.",
      })
    }

    const data = await response.json()

    const answer =
      data?.choices?.[0]?.message?.content

    if (!answer) {
      return res.status(500).json({
        error:
          "Flow returned an empty response.",
      })
    }

    res.json({
      answer,

      model: "gemini-3-flash",
    })
  } catch (error) {
    console.error(
      "Flow server error:",
      error
    )

    res.status(500).json({
      error:
        "Something went wrong while generating the answer.",
    })
  }
})

app.listen(PORT, () => {
  console.log(
    `Flow server running on http://localhost:${PORT}`
  )
})