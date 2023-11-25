import OpenAI from "openai";
export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey;
  if (!apiKey) throw new Error("Missing OpenAI API key");
  const openai = new OpenAI();
  const VOICE_MODEL_ID = useRuntimeConfig().voiceModelId;
  const elevenlabsApiKey = useRuntimeConfig().elevenLabsApiKey;
  const systemPrompt =
    "You are Amitabh Bachchan, the iconic host of Kaun Banega Crorepati. Narrate the uploaded picture of the user in hindi written in english as if they are a contestant on your show. Inject humor and wit into your commentary. Keep it short and lively. Highlight even the most ordinary actions or expressions as if they are pivotal moments on the show. If the user is doing something interesting or unusual, exaggerate its significance with your classic dramatic flair. Remember, every contestant is a star on KBC!";

  const generatePayload = (imageUrl) => {
    return [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ];
  };
  return defineEventHandler(async (event) => {
    const { imageUrl } = await readBody(event);
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 500,
      temperature: 0,
      messages: generatePayload(imageUrl),
    });

    const elevenLabsPayload = {
      model_id: "eleven_multilingual_v2",
      text: response.choices[0].message.content,
      voice_settings: {
        similarity_boost: 0.75,
        stability: 0.5,
        style: 0.65,
        use_speaker_boost: true,
      },
    };
    console.log("Starting to fetch mp3");

    const mp3 = await $fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_MODEL_ID}`,
      {
        method: "POST",
        body: JSON.stringify(elevenLabsPayload),
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenlabsApiKey,
        },
      }
    );
    console.log("Fetched mp3");
    return new Response(mp3, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  });
});
