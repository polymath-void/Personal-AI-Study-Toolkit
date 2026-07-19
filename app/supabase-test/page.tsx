import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-bold mb-4 text-emerald-400">Supabase Connection Test</h1>
        
        {error ? (
          <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-xs font-mono mb-4">
            Error: {error.message}
          </div>
        ) : (
          <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-xl text-xs font-mono mb-4">
            Successfully connected to Supabase!
          </div>
        )}

        <h2 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Todos List:</h2>
        {todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo: any) => (
              <li key={todo.id} className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30 text-xs">
                {todo.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No todos found or &quot;todos&quot; table is empty/not created yet.</p>
        )}
      </div>
    </div>
  )
}
