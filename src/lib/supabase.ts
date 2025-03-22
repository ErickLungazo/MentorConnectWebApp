
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fgxcpamkfoodqdrauxzu.supabase.co'
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZneGNwYW1rZm9vZHFkcmF1eHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NDExNDIsImV4cCI6MjA1NTAxNzE0Mn0.by6HAdPjwE3x3tdRGoSBvzOduJqG9FDHnFPTWaVD2Dc`
export const supabase = createClient(supabaseUrl, supabaseKey)