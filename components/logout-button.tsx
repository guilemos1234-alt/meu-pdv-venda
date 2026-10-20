'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
    >
      {loading ? (
        <span>Saindo...</span>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          Sair
        </>
      )}
    </button>
  )
}
