import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvimrtqbxexdmfskgqfi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2aW1ydHFieGV4ZG1mc2tncWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTU3MTgsImV4cCI6MjA3NDI3MTcxOH0.bBOG4jdpu98n9TkaM4739CgBf-uv5DFniLvm2omeVW8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
