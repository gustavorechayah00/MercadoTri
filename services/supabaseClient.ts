import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const SUPABASE_URL = 'https://aahvhcqkvcoeyyposavt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaHZoY3FrdmNvZXl5cG9zYXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDE5NTMsImV4cCI6MjA3OTkxNzk1M30.llUCR3xZy7NCS4ichDt2ROb7kvcN1mYw0Q7qT4_B2TU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
