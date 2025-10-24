import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EngagementEmailRequest {
  subscriber_id: string;
  campaign_id: string;
  email: string;
  template_type: string;
  subject: string;
}

const getEmailTemplate = (template_type: string, email: string) => {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 40px 20px;
  `;

  const containerStyle = `
    background: white;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  `;

  const templates = {
    welcome_followup: `
      <div style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 32px; font-weight: bold;">S</span>
            </div>
            <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0;">Thanks for joining SIOS! 🚀</h1>
          </div>
          
          <div style="color: #475569; font-size: 16px; line-height: 1.6;">
            <p>Hi there!</p>
            
            <p>Thank you for joining our waitlist! We're excited to have you on board.</p>
            
            <p>We're working hard to build something amazing and will keep you updated as we make progress.</p>
            
            <p>Stay tuned for more updates!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://join.slack.com/t/sios-space/shared_invite/zt-39um57med-X~_Yp3oBw7uu3oTqqXSoQg" 
               style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; display: inline-block;">
              Join Our Slack Community →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Thank you!<br><strong>The SIOS Team</strong></p>
          </div>
        </div>
      </div>
    `,
    
    feature_spotlight: `
      <div style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0;">🎯 Feature Spotlight: AI-Powered Lead Scoring</h1>
          </div>
          
          <div style="color: #475569; font-size: 16px; line-height: 1.6;">
            <p>Hi there!</p>
            
            <p>Today, we want to show you one of SIOS's most powerful features that we're building.</p>
            
            <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 24px;">⚡ Smart Lead Scoring</h2>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Our AI analyzes 200+ data points to score every lead in real-time</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #0f172a; margin: 0 0 15px 0;">🔥 What This Means for You:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>No more cold calling dead ends</strong> - Focus only on hot prospects</li>
                <li><strong>3x higher conversion rates</strong> - AI-driven insights</li>
                <li><strong>Save 15+ hours per week</strong> - Let AI do the heavy lifting</li>
              </ul>
            </div>
            
            <p>Ready to experience this yourself? Your early access is coming very soon!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://join.slack.com/t/sios-space/shared_invite/zt-39um57med-X~_Yp3oBw7uu3oTqqXSoQg" 
               style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; display: inline-block;">
              Join Our Slack Community →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Revolutionizing sales, one feature at a time,<br><strong>The SIOS Team</strong></p>
          </div>
        </div>
      </div>
    `,
    
    early_access: `
      <div style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0;">⚡ You're Almost In - Early Access Update!</h1>
          </div>
          
          <div style="color: #475569; font-size: 16px; line-height: 1.6;">
            <p>Hi there!</p>
            
            <p>Two weeks have passed since you joined our waitlist, and we have exciting news!</p>
            
            <div style="background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎉 Beta Launch: Next Week!</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Early access invitations start rolling out Monday</p>
            </div>
            
            <p><strong>Here's what happens next:</strong></p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Monday:</strong> First batch of invites (top 100 waitlist members)</li>
                <li><strong>Wednesday:</strong> Second batch (next 200 members)</li>
                <li><strong>Friday:</strong> Final batch for this week</li>
              </ul>
            </div>
            
            <p>Based on your signup date, you're in the <strong>first batch</strong>! Watch your inbox on Monday.</p>
            
            <p>Once you get access, you'll have:</p>
            <ul>
              <li>Full access to all SIOS features</li>
              <li>Personal onboarding session with our team</li>
              <li>30-day free premium trial</li>
              <li>Direct line to product feedback</li>
            </ul>
            
            <p>Get ready to transform your sales process! 🚀</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://join.slack.com/t/sios-space/shared_invite/zt-39um57med-X~_Yp3oBw7uu3oTqqXSoQg" 
               style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; display: inline-block;">
              Join Our Slack Community →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Almost there!<br><strong>The SIOS Team</strong></p>
          </div>
        </div>
      </div>
    `,
    
    community_invite: `
      <div style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0;">🤝 Join the SIOS Beta Community!</h1>
          </div>
          
          <div style="color: #475569; font-size: 16px; line-height: 1.6;">
            <p>Hi there!</p>
            
            <p>It's been 3 weeks since you joined our waitlist, and we wanted to invite you to something special.</p>
            
            <div style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">🌟 Exclusive Beta Community</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Connect with 500+ sales leaders transforming their processes</p>
            </div>
            
            <p><strong>What you'll get in our community:</strong></p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Early product demos</strong> - See new features first</li>
                <li><strong>Sales strategy discussions</strong> - Learn from peers</li>
                <li><strong>Direct Q&A with founders</strong> - Get your questions answered</li>
                <li><strong>Beta testing opportunities</strong> - Shape the product</li>
                <li><strong>Networking</strong> - Connect with like-minded professionals</li>
              </ul>
            </div>
            
            <p>Recent highlights from our community:</p>
            <ul>
              <li>Maria shared her 5-step AI sales workflow (300% ROI increase)</li>
              <li>David's cold email templates using SIOS insights (65% response rate)</li>
              <li>Weekly "Sales AI Masterclass" sessions with industry experts</li>
            </ul>
            
            <p>Ready to level up your sales game with fellow innovators?</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://join.slack.com/t/sios-space/shared_invite/zt-39um57med-X~_Yp3oBw7uu3oTqqXSoQg" 
               style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; display: inline-block;">
              Join Our Slack Community →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Building together,<br><strong>The SIOS Team</strong></p>
          </div>
        </div>
      </div>
    `,
    
    launch_countdown: `
      <div style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0;">🎉 Final Days: SIOS Launches This Week!</h1>
          </div>
          
          <div style="color: #475569; font-size: 16px; line-height: 1.6;">
            <p>Hi there!</p>
            
            <p>We can barely contain our excitement - after months of development and testing, SIOS officially launches this week!</p>
            
            <div style="background: linear-gradient(135deg, #ef4444, #f59e0b, #10b981); color: white; padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 32px;">⏰ 3 DAYS TO GO!</h2>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your early access starts Friday at 9 AM PST</p>
            </div>
            
            <p><strong>Here's your launch day timeline:</strong></p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>9:00 AM:</strong> Early access email with login credentials</li>
                <li><strong>10:00 AM:</strong> Personal onboarding call invitation</li>
                <li><strong>11:00 AM:</strong> Access to exclusive launch day webinar</li>
                <li><strong>2:00 PM:</strong> Special pricing locks in (50% off first year)</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: white;">🎁 Launch Week Exclusive:</h3>
              <p style="margin: 0; opacity: 0.9;">As a waitlist member, you get 50% off your first year + personal setup session with our team (Value: $2,000)</p>
            </div>
            
            <p>We want to personally thank you for believing in our vision from day one. You've been part of this journey, and now it's time to see SIOS revolutionize your sales process!</p>
            
            <p><strong>Action needed:</strong> Make sure to whitelist our emails so you don't miss your access credentials on Friday!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://join.slack.com/t/sios-space/shared_invite/zt-39um57med-X~_Yp3oBw7uu3oTqqXSoQg" 
               style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; display: inline-block;">
              Join Our Slack Community →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>The future of sales starts now,<br><strong>The SIOS Team</strong></p>
          </div>
        </div>
      </div>
    `
  };

  return templates[template_type as keyof typeof templates] || templates.welcome_followup;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { subscriber_id, campaign_id, email, template_type, subject }: EngagementEmailRequest = await req.json();

    console.log(`Sending ${template_type} email to:`, email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "SIOS <hello@sios.energy>",
      to: [email],
      subject: subject,
      html: getEmailTemplate(template_type, email),
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

    // Record the email send in the database
    const { error: insertError } = await supabase
      .from('email_sends')
      .insert({
        subscriber_id,
        campaign_id,
        resend_message_id: emailResponse.data?.id,
        email_status: 'sent'
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    console.log(`${template_type} email sent successfully to:`, email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Engagement email sent successfully',
        resend_id: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-engagement-email function:', error);
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
