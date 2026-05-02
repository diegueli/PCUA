import React from 'react';
import { Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSession, computeSessionStats } from '../context/SessionContext.jsx';
import { formatCLP } from '../utils/currency.js';

export default function TableBalanceWidget() {
  const { state } = useSession();
  const { players } = state;
  const { totalInvested, totalFinalChips, discrepancy, isBalanced } = computeSessionStats(state);

  if (players.length === 0) return null;

  return (
    <div style={{
      margin: '0 16px 16px', borderRadius: 18, border: `1px solid ${isBalanced ? 'var(--emerald-border)' : 'var(--crimson-border)'}`,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
      backgroundColor: isBalanced ? 'var(--emerald-glow)' : 'var(--crimson-glow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isBalanced ? <Scale size={18} color="#00C851" /> : <AlertTriangle size={18} color="#FF3B1F" />}
        <span style={{ fontSize: 12, fontWeight: 800, color: isBalanced ? '#00C851' : '#FF3B1F', letterSpacing: 1.5 }}>BALANCE DE MESA</span>
      </div>

      {/* Equation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <EqSide label="Σ Entradas" value={totalInvested} />
        <span style={{ fontSize: 28, fontWeight: 900, color: isBalanced ? '#00C851' : '#FF3B1F', width: 32, textAlign: 'center' }}>{isBalanced ? '=' : '≠'}</span>
        <EqSide label="Σ Fichas Finales" value={totalFinalChips} />
      </div>

      {/* Status */}
      {isBalanced ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'var(--emerald-glow)', border: '1px solid var(--emerald-border)', borderRadius: 12, padding: 8 }}>
          <CheckCircle2 size={16} color="#00C851" />
          <span style={{ fontSize: 12, color: '#00C851', fontWeight: 700 }}>Mesa Cuadrada — Lista para liquidar</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'var(--crimson-glow)', border: '1px solid var(--crimson-border)', borderRadius: 12, padding: 8 }}>
          <AlertTriangle size={16} color="#FF3B1F" />
          <span style={{ fontSize: 12, color: '#FF3B1F', fontWeight: 700 }}>
            Descuadre: {formatCLP(Math.abs(discrepancy))} CLP {discrepancy > 0 ? '(faltan fichas)' : '(sobran fichas)'}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {totalInvested > 0 && <ProgressBar totalInvested={totalInvested} totalFinalChips={totalFinalChips} isBalanced={isBalanced} />}
    </div>
  );
}

function EqSide({ label, value }) {
  return (
    <div style={{ flex: 1, backgroundColor: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 8, textAlign: 'center' }}>
      <p style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#F2F2F2' }}>{formatCLP(value)}</p>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>CLP</p>
    </div>
  );
}

function ProgressBar({ totalInvested, totalFinalChips, isBalanced }) {
  const ratio = Math.min(totalFinalChips / totalInvested, 1);
  const overflow = totalFinalChips > totalInvested;
  const barColor = isBalanced ? '#00C851' : overflow ? '#FF9500' : '#FF3B1F';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5 }}>Cobertura de fichas</span>
      <div style={{ height: 6, backgroundColor: 'var(--glass)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${ratio * 100}%`, backgroundColor: barColor, borderRadius: 9999, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: isBalanced ? '#00C851' : '#FF3B1F', textAlign: 'right' }}>{Math.round(ratio * 100)}%</span>
    </div>
  );
}
