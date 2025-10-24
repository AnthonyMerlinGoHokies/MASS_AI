import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email }: ResendRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email exists in waitlist
    const { data: subscriber, error: fetchError } = await supabase
      .from('waitlist_subscribers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError || !subscriber) {
      return new Response(
        JSON.stringify({ error: 'Email not found in waitlist' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: 'SIOS <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to SIOS - Your AI Sales Revolution',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px; font-weight: bold;">S</span>
              </div>
              <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0; line-height: 1.2;">
                Your Sales Team Just Got Smarter
              </h1>
            </div>
            
            <div style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              <p>Hi there!</p>
              
              <p>Welcome to SIOS – where artificial intelligence meets sales excellence. You've just joined an exclusive group of forward-thinking professionals who are ready to transform their sales process.</p>
              
              <p><strong style="color: #06b6d4;">What happens next?</strong></p>
              <ul style="padding-left: 20px;">
                <li>Our AI agents are already learning about your industry</li>
                <li>You'll receive early access to game-changing features</li>
                <li>We'll show you exactly how to 10x your sales performance</li>
              </ul>
              
              <p>Get ready to experience sales automation that actually works. Your pipeline is about to become your most valuable asset.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://6b965b1d-b0e3-4361-a051-42b9c0144849.lovableproject.com" 
                 style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; display: inline-block; transition: all 0.3s ease;">
                See SIOS in Action →
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Thanks for joining the revolution,<br><strong>The SIOS Team</strong></p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Confirmation email resent successfully to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email resent successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in resend-waitlist-confirmation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);