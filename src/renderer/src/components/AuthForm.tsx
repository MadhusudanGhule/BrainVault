import React, { useState, useEffect } from 'react'

export function AuthForm() {
  const [user, setUser] = useState<any>(null)
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { ;(async ()=> setUser(await (window as any).api.auth.getCurrentUser()))() }, [])

  async function register() {
    try {
      const udata = await (window as any).api.auth.register(u, p)
      setUser(udata); setErr('')
    } catch (e: any) { setErr(e?.message || String(e)) }
  }
  async function login() {
    try {
      const udata = await (window as any).api.auth.login(u, p)
      setUser(udata); setErr('')
    } catch (e: any) { setErr(e?.message || String(e)) }
  }
  async function logout() {
    await (window as any).api.auth.logout()
    setUser(null)
  }

  return (
    <div>
      {user ? (
        <div>
          <div>Signed in as {user.username}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <input value={u} onChange={e=>setU(e.target.value)} placeholder="username" />
          <input value={p} onChange={e=>setP(e.target.value)} placeholder="password" type="password" />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
          {err && <div style={{color:'red'}}>{err}</div>}
        </div>
      )}
    </div>
  )
}