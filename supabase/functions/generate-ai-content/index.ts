import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, content } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'summary':
        systemPrompt = 'Je bent een expert in het schrijven van heldere, beknopte samenvattingen. Schrijf in het Nederlands.';
        userPrompt = `Maak een korte, duidelijke samenvatting van de volgende tekst in maximaal 100 woorden:\n\n${content}`;
        break;
      case 'rewrite':
        systemPrompt = 'Je bent een expert tekstschrijver die tekst kan verbeteren qua leesbaarheid, stijl en helderheid. Schrijf in het Nederlands.';
        userPrompt = `Herschrijf de volgende tekst om deze duidelijker en beter leesbaar te maken:\n\n${content}`;
        break;
      case 'titles':
        systemPrompt = 'Je bent een expert in het bedenken van aantrekkelijke, SEO-vriendelijke titels. Schrijf in het Nederlands.';
        userPrompt = `Bedenk 5 alternatieve titels voor een artikel met de volgende inhoud:\n\n${content}`;
        break;
      case 'expand':
        systemPrompt = 'Je bent een expert schrijver die tekst kan uitbreiden met relevante details en voorbeelden. Schrijf in het Nederlands.';
        userPrompt = `Breid de volgende tekst uit met meer details, voorbeelden en context:\n\n${content}`;
        break;
      case 'improve':
        systemPrompt = 'Je bent een editor die tekst kan verbeteren qua grammatica, stijl en structuur. Schrijf in het Nederlands.';
        userPrompt = `Verbeter de volgende tekst qua grammatica, stijl en structuur:\n\n${content}`;
        break;
      default:
        systemPrompt = 'Je bent een behulpzame assistent die content genereert op basis van gebruikersvragen. Schrijf in het Nederlands.';
        userPrompt = prompt;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});