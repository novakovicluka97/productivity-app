export class MissingSupabaseEnvError extends Error {
  constructor() {
    super(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
        'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
    this.name = 'MissingSupabaseEnvError'
  }
}
