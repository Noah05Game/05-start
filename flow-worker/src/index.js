const ALLOWED_ORIGIN = "https://noah.startpage.the05company.com"

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    if (request.method !== "POST") {
      return json(
        {
          error: "Method not allowed.",
        },
        405
      )
    }

    const origin = request.headers.get("Origin")

    if (origin !== ALLOWED_ORIGIN) {
      return json(
        {
          error: "Origin not allowed.",
        },
        403
      )
    }

    try {
      const body = await request.json()
      const query = body?.query

      if (!query || typeof query !== "string") {
        return json(
          {
            error: "A search query is required.",
          },
          400
        )
      }

      const response = await fetch(
        "https://gen.pollinations.ai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${env.POLLINATIONS_API_KEY}`,
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
        const errorText = await response.text()

        console.error(
          "Pollinations error:",
          response.status,
          errorText
        )

        return json(
          {
            error: "Flow could not generate a response.",
          },
          response.status
        )
      }

      const data = await response.json()

      const answer =
        data?.choices?.[0]?.message?.content

      if (!answer) {
        return json(
          {
            error: "Flow returned an empty response.",
          },
          500
        )
      }

      return json({
        answer,
        model: "05 AI",
      })
    } catch (error) {
      console.error("Flow Worker error:", error)

      return json(
        {
          error: "Something went wrong while generating the answer.",
        },
        500
      )
    }
  },
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,

    headers: {
      "Content-Type": "application/json",

      "Access-Control-Allow-Origin":
        ALLOWED_ORIGIN,

      "Access-Control-Allow-Methods":
        "POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type",
    },
  })
}