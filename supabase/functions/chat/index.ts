import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables are missing');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch custom instructions
    const { data: instructions, error: instructionsError } = await supabase
      .from('custom_instructions')
      .select('content')
      .eq('app_id', 'napoleon');

    if (instructionsError) {
      console.error('Error fetching instructions:', instructionsError);
      throw instructionsError;
    }

    // Combine all instruction contents into a single system message
    const systemInstructions = instructions
      .map(instruction => instruction.content)
      .join('\n\n');

    // Prepare messages array with system instructions
    const allMessages = [
      {
        role: 'system',
        content: `${systemInstructions}\n\nBe helpful and follow the instructions above.`
      },
      ...messages
    ];

    console.log('Sending request to OpenAI:', { messages: allMessages });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    console.log('Received response from OpenAI:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }

    // Extract just the text content from the response
    const content = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});