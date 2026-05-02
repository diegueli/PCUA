import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';

export default function AddPlayerModal({ visible, onClose }) {
  const { dispatch } = useSession();
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) { setName(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [visible]);

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch({ type: 'ADD_PLAYER', payload: { name: name.trim(), photo: null } });
    setName('');
    onClose();
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--overlay)' }} />

      {/* Sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111111', borderTop: '1px solid var(--glass-border)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, backgroundColor: 'var(--glass-border-strong)', borderRadius: 9999, alignSelf: 'center', marginBottom: 8 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <UserPlus size={22} color="#00C851" />
          <span style={{ flex: 1, fontSize: 18, fontWeight: 800, color: '#F2F2F2' }}>Agregar Jugador</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={22} color="var(--text-secondary)" />
          </button>
        </div>

        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 0.5 }}>Nombre del jugador</span>

        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Ej: Alex, Juan, María..."
          maxLength={30}
          style={{
            backgroundColor: 'var(--glass)', border: '1px solid var(--glass-border-strong)',
            borderRadius: 12, padding: '12px 16px', fontSize: 16, color: '#F2F2F2',
            fontWeight: 600, outline: 'none', width: '100%',
          }}
        />

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: name.trim() ? '#00C851' : 'var(--glass)',
            border: name.trim() ? 'none' : '1px solid var(--glass-border)',
            borderRadius: 18, padding: '12px 0', cursor: name.trim() ? 'pointer' : 'default',
            color: name.trim() ? '#0A0A0A' : 'var(--text-muted)', fontSize: 16, fontWeight: 800,
          }}
        >
          <UserPlus size={18} color={name.trim() ? '#0A0A0A' : 'var(--text-muted)'} />
          Agregar a la mesa
        </button>

        <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8 }}>
          💡 Podrás agregar la foto del jugador tocando el avatar en la tarjeta.
        </p>
      </div>
    </div>
  );
}
