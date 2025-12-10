import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpaawqmstfajvbpmqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXBhYXdxbXN0ZmFqdmJwbXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzUyNjYsImV4cCI6MjA4MDkxMTI2Nn0.N54Awbqa4VLdlVg8-AvEkq5P0O1GAoLw9XilojTgguM';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to upload a file to Supabase Storage
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return data;
};