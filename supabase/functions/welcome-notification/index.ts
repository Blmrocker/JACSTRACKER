import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Twilio } from 'https://esm.sh/twilio@4.20.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const twilio = new Twilio(twilioAccountSid, twilioAuthToken)

serve(async (req) => {
  try {
    const { user_id, email, phone_number } = await req.json()

    // Fetch user role
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id)
      .single()

    if (userError) throw userError

    // Send welcome email
    const { error: emailError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        welcome_email_sent: true
      }
    })

    if (emailError) throw emailError

    // Send welcome SMS if phone number is provided
    if (phone_number) {
      await twilio.messages.create({
        body: `Welcome to Jac's Fire Tracker! You've been added as a ${userData.role}. Login at https://jacsfire.com with your email: ${email}`,
        to: phone_number,
        from: twilioPhoneNumber
      })
    }

    return new Response(
      JSON.stringify({ message: 'Welcome notifications sent successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})