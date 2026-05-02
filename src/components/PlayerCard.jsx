import React, { useState, useRef } from 'react';
import { Trash2, Camera, PlusCircle, X, TrendingUp, TrendingDown, Banknote, CircleDollarSign } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import { formatCLP, formatCLPSigned } from '../utils/currency.js';

function Avatar({ name, photo, onPhotoChange }) {
  const fileRef = useRef(null);
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onPhotoChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {photo ? (
        <img src={photo} alt={name} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #00C851', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--glass-md)', border: '2px solid var(--glass-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#00C851', letterSpacing: 1 }}>{initials}</span>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00C851', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Camera size={8} color="#0A0A0A" />
      </div>
    </div>
  );
}

function ConfirmCheckbox({ confirmed, confirmedAt, onToggle, disabled }) {
  const time = confirmedAt ? new Date(confirmedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : null;
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 3, borderRadius: 8,
        padding: '6px 8px', border: 'none', cursor: disabled ? 'default' : 'pointer', minWidth: 32, justifyContent: 'center',
        backgroundColor: confirmed ? '#00C851' : 'var(--crimson-glow)',
        outline: confirmed ? 'none' : '1px solid var(--crimson-border)',
      }}
    >
      {confirmed
        ? <span style={{ fontSize: 12, color: '#0A0A0A', fontWeight: 900 }}>✓</span>
        : <Banknote size={12} color="#FF3B1F" />}
      {time && <span style={{ fontSize: 9, color: confirmed ? '#0A0A0A' : '#FF3B1F', fontWeight: 700 }}>{time}</span>}
    </button>
  );
}

function RebuyRow({ rebuy, index, playerId, disabled }) {
  const { dispatch } = useSession();
  const [raw, setRaw] = useState(rebuy.amount > 0 ? rebuy.amount.toString() : '');
  const glowing = rebuy.amount > 0 && !rebuy.confirmed;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', margin: '2px 4px', borderRadius: 8, backgroundColor: glowing ? 'var(--crimson-glow)' : 'transparent', outline: glowing ? '1px solid var(--crimson-border)' : 'none' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 60, fontWeight: 600 }}>Rebuy {index + 1}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: 'var(--glass-md)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '4px 8px' }}>
        <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 700, marginRight: 2 }}>$</span>
        <input
          type="number"
          value={raw}
          onChange={e => { const c = e.target.value.replace(/[^0-9]/g, ''); setRaw(c); dispatch({ type: 'UPDATE_REBUY', payload: { playerId, rebuyId: rebuy.id, amount: parseInt(c) || 0 } }); }}
          disabled={disabled}
          placeholder="0"
          style={{ flex: 1, fontSize: 16, color: '#F2F2F2', fontWeight: 600, background: 'transparent', border: 'none', outline: 'none' }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>CLP</span>
      </div>
      <ConfirmCheckbox confirmed={rebuy.confirmed} confirmedAt={rebuy.confirmedAt} onToggle={() => dispatch({ type: 'TOGGLE_REBUY_CONFIRMED', payload: { playerId, rebuyId: rebuy.id } })} disabled={disabled} />
      {!disabled && (
        <button onClick={() => dispatch({ type: 'REMOVE_REBUY', payload: { playerId, rebuyId: rebuy.id } })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={14} color="var(--text-muted)" />
        </button>
      )}
    </div>
  );
}

export default function PlayerCard({ player }) {
  const { dispatch, state } = useSession();
  const { globalBuyIn, sessionState } = state;
  const isLocked = sessionState !== 'OPEN';

  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const totalInvested = globalBuyIn + rebuysTotal;
  const pnl = player.finalChips - totalInvested;
  const hasFinal = player.finalChips > 0;
  const hasBuyIn = globalBuyIn > 0;
  const hasUnconfirmed = (hasBuyIn && !player.buyInConfirmed) || player.rebuys.some(r => r.amount > 0 && !r.confirmed);

  const [finalRaw, setFinalRaw] = useState(player.finalChips > 0 ? player.finalChips.toString() : '');

  const handleRemove = () => {
    if (window.confirm(`Eliminar a ${player.name || 'este jugador'} de la mesa?`)) {
      dispatch({ type: 'REMOVE_PLAYER', payload: player.id });
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--glass)', border: `1px solid ${hasUnconfirmed ? 'var(--crimson-border)' : 'var(--glass-border)'}`,
      borderRadius: 18, margin: '0 16px 12px', overflow: 'hidden',
      boxShadow: hasUnconfirmed ? '0 0 12px rgba(204,34,0,0.3)' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: 12, gap: 8 }}>
        <Avatar name={player.name} photo={player.photo} onPhotoChange={uri => dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'photo', value: uri } })} />
        <div style={{ flex: 1 }}>
          <input
            value={player.name}
            onChange={e => dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'name', value: e.target.value } })}
            placeholder="Nombre del jugador"
            disabled={isLocked}
            style={{ fontSize: 16, fontWeight: 700, color: '#F2F2F2', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
          />
          {totalInvested > 0 && <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Invirtió {formatCLP(totalInvested)} CLP</p>}
        </div>
        {hasFinal && totalInvested > 0 && (
          <div style={{ borderRadius: 8, padding: '3px 8px', border: `1px solid ${pnl >= 0 ? 'var(--emerald-border)' : 'var(--crimson-border)'}`, backgroundColor: pnl >= 0 ? 'var(--emerald-glow)' : 'var(--crimson-glow)' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: pnl >= 0 ? '#00C851' : '#FF3B1F' }}>{formatCLPSigned(pnl)}</span>
          </div>
        )}
        <button onClick={handleRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Trash2 size={18} color="var(--text-muted)" />
        </button>
      </div>

      <div style={{ height: 1, backgroundColor: 'var(--divider)', margin: '0 16px' }} />

      {/* Buy-in */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', margin: '2px 4px', borderRadius: 8, backgroundColor: hasBuyIn && !player.buyInConfirmed ? 'var(--crimson-glow)' : 'transparent', outline: hasBuyIn && !player.buyInConfirmed ? '1px solid var(--crimson-border)' : 'none' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 60, fontWeight: 600 }}>Buy-in</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--glass)', border: '1px solid var(--emerald-border)', borderRadius: 8, padding: '4px 8px' }}>
          <CircleDollarSign size={14} color="#00C851" />
          <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#00C851', padding: '4px 0' }}>{hasBuyIn ? formatCLP(globalBuyIn) : '—'}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>CLP</span>
        </div>
        <ConfirmCheckbox confirmed={player.buyInConfirmed} confirmedAt={player.buyInConfirmedAt} onToggle={() => dispatch({ type: 'TOGGLE_BUYIN_CONFIRMED', payload: player.id })} disabled={!hasBuyIn || isLocked} />
      </div>

      {/* Rebuys */}
      {player.rebuys.map((r, i) => <RebuyRow key={r.id} rebuy={r} index={i} playerId={player.id} disabled={isLocked} />)}

      {!isLocked && (
        <button onClick={() => dispatch({ type: 'ADD_REBUY', payload: player.id })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#00C851', fontSize: 12, fontWeight: 600 }}>
          <PlusCircle size={15} color="#00C851" /> Agregar Rebuy
        </button>
      )}

      <div style={{ height: 1, backgroundColor: 'var(--divider)', margin: '0 16px' }} />

      {/* Fichas finales */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
        <CircleDollarSign size={18} color="#FF9500" />
        <span style={{ fontSize: 12, color: '#FF9500', fontWeight: 700, width: 100 }}>Fichas Finales</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: 'var(--glass-strong)', border: '1px solid var(--glass-border-strong)', borderRadius: 8, padding: '4px 8px' }}>
          <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 700, marginRight: 2 }}>$</span>
          <input
            type="number"
            value={finalRaw}
            onChange={e => { const c = e.target.value.replace(/[^0-9]/g, ''); setFinalRaw(c); dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'finalChips', value: parseInt(c) || 0 } }); }}
            placeholder="0"
            style={{ flex: 1, fontSize: 16, color: '#F2F2F2', fontWeight: 600, background: 'transparent', border: 'none', outline: 'none' }}
          />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>CLP</span>
        </div>
      </div>

      {/* Resultado */}
      {hasFinal && totalInvested > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 16px 12px', padding: 8, borderRadius: 12, border: `1px solid ${pnl >= 0 ? 'var(--emerald-border)' : 'var(--crimson-border)'}`, backgroundColor: pnl >= 0 ? 'var(--emerald-glow)' : 'var(--crimson-glow)' }}>
          {pnl >= 0 ? <TrendingUp size={16} color="#00C851" /> : <TrendingDown size={16} color="#FF3B1F" />}
          <span style={{ fontSize: 14, fontWeight: 800, color: pnl >= 0 ? '#00C851' : '#FF3B1F', letterSpacing: 0.3 }}>
            Resultado: {formatCLPSigned(pnl)} CLP
          </span>
        </div>
      )}
    </div>
  );
}
