// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function generateResponse(message: string) {
//   const completion = await client.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are a helpful college information assistant. Answer clearly and concisely.",
//       },
//       {
//         role: "user",
//         content: message,
//       },
//     ],
//   });

//   const choice = completion.choices[0];
//   if (!choice) {
//     return "I'm sorry, I couldn't generate a response at this time.";
//   }

//   return choice.message.content || "I'm sorry, I couldn't generate a response.";
// }

export async function generateStream(message: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "College Chatbot"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      stream:true,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful college information assistant. Answer clearly and concisely.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });
return response.body;

  // const data = await response.json();

  // if (!response.ok) {
  //   console.error(data);
  //   throw new Error("OpenRouter API error");
  // }

  // return data.choices[0].message.content;
}