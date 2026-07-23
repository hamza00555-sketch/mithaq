import { useState } from 'react'
import BrandMark from './BrandMark'
import Icon from './Icon'

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`mithaq:${pin}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const getStoredPin = () => localStorage.getItem('mithaq_pin')
export const setStoredPin = (hash: string | null) => {
  if (hash) localStorage.setItem('mithaq_pin', hash)
  else localStorage.removeItem('mithaq_pin')
}

export default function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const press = async (d: string) => {
    if (d === '⌫') { setPin(p => p.slice(0, -1)); return }
    const next = pin + d
    setPin(next)
      if (next.length === 4) {
      const h = await hashPin(next)
      if (h === getStoredPin()) onUnlock()
      else {
        setShake(true)
        setTimeout(() => { setPin(''); setShake(false) }, 450)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-8"
      style={{ background: 'radial-gradient(620px 430px at 50% -80px, #f2d8c5 0%, #f8f1ea 72%)' }}>
      <BrandMark size={78} />
      <div className="gold-glow text-2xl font-extrabold">ميثاق</div>
      <div className={`flex gap-4 ${shake ? 'animate-[popin_.15s_ease-in-out_3]' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border ${pin.length > i ? 'bg-gold border-gold' : 'border-lavender/40'}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
          <button key={i} disabled={!d} onClick={() => press(d)}
            className={`w-16 h-16 rounded-full text-xl font-bold ${d ? 'glass active:scale-95 transition-transform' : 'opacity-0'}`}>
            {d === '⌫' ? <Icon name="close" size={21} className="mx-auto" /> : d}
          </button>
        ))}
      </div>
    </div>
  )
}
