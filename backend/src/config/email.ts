import { Resend } from 'resend';
import { config } from 'dotenv';

config();

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will be logged instead of sent.');
}

const resend = apiKey ? new Resend(apiKey) : null;

export default resend;
