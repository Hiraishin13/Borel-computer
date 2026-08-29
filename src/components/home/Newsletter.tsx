'use client'

import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section className="container-page py-20">
      <div className="card flex flex-col items-center gap-6 px-6 py-14 text-center">
        <h2 className="text-2xl font-bold">Restez informé</h2>
        <p className="max-w-md text-muted">
          Nouveautés, offres exclusives et guides d&apos;achat — directement dans votre boîte mail.
        </p>
        {done ? (
          <p className="text-success">Merci ! Vérifiez votre boîte mail pour confirmer.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setDone(true)
            }}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.com"
              className="input"
            />
            <button type="submit" className="btn-primary shrink-0">
              S&apos;inscrire
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
