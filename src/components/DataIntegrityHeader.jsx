import React from 'react';
import { Spade, Lock, LockOpen, CheckCircle2, RefreshCw } from 'lucide-react';
import { useSession, computeSessionStats } from '../context/SessionContext.jsx';
import { formatCLP } from '../utils/currency.js';

const STATE_LABEL = { OPEN: 'Mesa Abierta', LOCKED: 'Contando Fichas', SETTLED: 'Liquidada' };
const STATE_COLOR = { OPEN: '#00C851', LOCKED: '#FF9500', SETTLED: '#5B8DEF' };

export default function DataIntegrityHeader() {
  const { state, dispatch } = useSession();
  const { sessionState, players, sessionDate } = state;
  const { confirmedPot, unconfirmedDebt } = computeSessionStats(state);

  const color = STATE_COLOR[sessionState];
  const date = new Date(sessionDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ backgroundColor: '#111111', borderBottom: '1px solid var(--glass-border)', padding: '20px 16px 12px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spade size={22} color="#00C851" />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#F2F2F2', letterSpacing: 2 }}>POKER ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${color}`, borderRadius: 9999, padding: '3px 10px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color }} />
          <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 0.5 }}>{STATE_LABEL[sessionState]}</span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{date}</p>

      {/* Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MetricCard label="POT CONFIRMADO" amount={confirmedPot} color="#00C851" bg="var(--emerald-glow)" border="var(--emerald-border)" />
        <RefreshCw size={24} color={unconfirmedDebt > 0 ? '#FF3B1F' : 'var(--text-muted)'} />
        <MetricCard
          label="DEUDA PENDIENTE"
          amount={unconfirmedDebt}
          color={unconfirmedDebt > 0 ? '#FF3B1F' : 'var(--text-muted)'}
          bg={unconfirmedDebt > 0 ? 'var(--crimson-glow)' : 'var(--glass)'}
          border={unconfirmedDebt > 0 ? 'var(--crimson-border)' : 'var(--glass-border)'}
        />
      </div>

      <SessionStateControls sessionState={sessionState} dispatch={dispatch} />
    </div>
  );
}

function MetricCard({ label, amount, color, bg, border }) {
  return (
    <div style={{ flex: 1, backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 8, textAlign: 'center' }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color }}>{formatCLP(amount)}</p>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>CLP</p>
    </div>
  );
}

function SessionStateControls({ sessionState, dispatch }) {
  const btn = (label, Icon, color, border, onClick) => (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      border: `1px solid ${border}`, borderRadius: 9999, padding: '6px 12px',
      backgroundColor: 'transparent', cursor: 'pointer', color, fontSize: 12, fontWeight: 600,
    }}>
      <Icon size={14} color={color} /> {label}
    </button>
  );

  if (sessionState === 'OPEN') return (
    <div style={{ display: 'flex' }}>
      {btn('Bloquear para contar fichas', Lock, '#FF9500', 'var(--glass-border)', () => dispatch({ type: 'SET_SESSION_STATE', payload: 'LOCKED' }))}
    </div>
  );

  if (sessionState === 'LOCKED') return (
    <div style={{ display: 'flex', gap: 8 }}>
      {btn('Re-abrir mesa', LockOpen, 'var(--text-secondary)', 'var(--glass-border)', () => dispatch({ type: 'SET_SESSION_STATE', payload: 'OPEN' }))}
      {btn('Liquidar sesión', CheckCircle2, '#00C851', 'var(--emerald-border)', () => dispatch({ type: 'SET_SESSION_STATE', payload: 'SETTLED' }))}
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'var(--emerald-glow)', border: '1px solid var(--emerald-border)', borderRadius: 9999, padding: '6px 12px' }}>
      <CheckCircle2 size={14} color="#00C851" />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#00C851' }}>Sesión liquidada</span>
    </div>
  );
}
