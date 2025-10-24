
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DatabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    email: string;
    created_at: string;
    source_page?: string;
    status: string;
  };
  schema: string;
  old_record: null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: DatabaseWebhookPayload = await req.json();
    
    // Only process INSERT events for waitlist_subscribers table
    if (payload.type !== 'INSERT' || payload.table !== 'waitlist_subscribers') {
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email } = payload.record;
    
    console.log("Sending confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "SIOS <hello@sios.energy>",
      to: [email],
      subject: "🎉 Welcome to the SIOS Waitlist!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to SIOS!</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f9fafb; 
                line-height: 1.6;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%); 
                padding: 40px 20px; 
                text-align: center; 
              }
              .header h1 { 
                color: white; 
                margin: 0; 
                font-size: 28px; 
                font-weight: bold; 
              }
              .content { 
                padding: 40px 30px; 
              }
              .content h2 { 
                color: #1f2937; 
                margin: 0 0 20px 0; 
                font-size: 24px; 
              }
              .content p { 
                color: #4b5563; 
                margin: 0 0 20px 0; 
                font-size: 16px;
              }
              .highlight { 
                background: linear-gradient(135deg, #60a5fa, #34d399); 
                -webkit-background-clip: text; 
                -webkit-text-fill-color: transparent; 
                background-clip: text; 
                font-weight: bold; 
              }
              .benefits {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .benefits ul {
                margin: 0;
                padding-left: 20px;
              }
              .benefits li {
                margin: 8px 0;
                color: #374151;
              }
              .footer { 
                background-color: #f3f4f6; 
                padding: 20px; 
                text-align: center; 
                color: #6b7280; 
                font-size: 14px; 
              }
              .emoji { font-size: 1.2em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1><span class="emoji">🚀</span> SIOS</h1>
              </div>
              <div class="content">
                <h2>Thanks for joining! <span class="emoji">🎉</span></h2>
                <p>We're absolutely thrilled to have you on our waitlist for <span class="highlight">SIOS</span> - the world's most advanced AI-powered sales intelligence platform.</p>
                
                <p>You're now part of an exclusive group that will be the first to experience how we're revolutionizing sales and business growth!</p>
                
                <div class="benefits">
                  <p><strong>What's coming your way:</strong></p>
                  <ul>
                    <li><span class="emoji">🎯</span> <strong>Early access</strong> before anyone else</li>
                    <li><span class="emoji">💎</span> <strong>Exclusive updates</strong> on our progress</li>
                    <li><span class="emoji">🎁</span> <strong>Special launch bonuses</strong> and pricing</li>
                    <li><span class="emoji">🤝</span> <strong>Direct line to our team</strong> for feedback</li>
                  </ul>
                </div>
                
                <p>We'll be in touch soon with exciting updates and your early access invitation. Keep an eye on your inbox!</p>
                
                <p>Thanks again for believing in our mission to erase sales friction and ignite a new era of human prosperity.</p>
                
                <p>
                  Warmly,<br>
                  <strong><span class="emoji">✨</span> The SIOS Team</strong>
                </p>
              </div>
              <div class="footer">
                <p>You're receiving this because you joined our waitlist at sios.com</p>
                <p>If you didn't sign up, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-waitlist-confirmation-trigger function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response || error.cause || "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
