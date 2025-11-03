// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jkzybryfoqeunidrigos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprenlicnlmb3FldW5pZHJpZ29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODA2MDcsImV4cCI6MjA3NTU1NjYwN30.QLZv-XTNWfTFIzGloUiodhOHbxEW5UQnadELSXoTjLE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

