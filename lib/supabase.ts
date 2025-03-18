import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akbghnvnpkksqjvmjpsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrYmdobnZucGtrc3Fqdm1qcHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNDE3OTYsImV4cCI6MjA1NzgxNzc5Nn0.b_8l7FcE-hmh61Md1y7jsiWVsGly0lTvvdoSM24rxEI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);