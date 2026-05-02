import React, { useState, useEffect } from 'react';
import { Banknote, Building2, Lock } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';

function AmountField({ label, Icon, iconColor, value, onCommit, disabled }) {
  const [raw, setRaw] = useState(value > 0 ? value.toString() : '');

  useEffect(() => { setRaw(value > 0 ? value.toString() : ''); }, [value]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon size={14} color={iconColor} />
        <span style={{ fontSize: 10, fontWeight: 700, color: iconColor, letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--glass-md)', border: '1px solid var(--glass-border-strong)', borderRadius: 8, padding: '6px 8px' }}>
        <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 700, marginRight: 2 }}>$</span>
        <input
          type="number"
          value={raw}
          onChange={e => setRaw(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={() => onCommit(parseInt(raw) || 0)}
          placeholder="0"
          disabled={disabled}
          maxLength={9}
          style={{
            flex: 1, fontSize: 16, color: disabled ? 'var(--text-secondary)' : '#F2F2F2',
            fontWeight: 700, background: 'transparent', border: 'none', outline: 'none',
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5 }}>CLP</span>
      </div>
    </div>
  );
}

export default function SessionConfig() {
  const { state, dispatch } = useSession();
  const { globalBuyIn, utilidad, sessionState } = state;
  const isLocked = sessionState !== 'OPEN';

  return (
    <div style={{ margin: '0 16px 12px', backgroundColor: 'var(--glass)', border: '1px solid var(--emerald-border)', borderRadius: 18, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: '#00C851', letterSpacing: 1.5 }}>CONFIGURACIÓN DE MESA</span>
        {isLocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'var(--warning-glow)', border: '1px solid #FF9500', borderRadius: 9999, padding: '2px 7px' }}>
            <Lock size={10} color="#FF9500" />
            <span style={{ fontSize: 9, color: '#FF9500', fontWeight: 700 }}>Bloqueada</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AmountField label="Buy-in (igual para todos)" Icon={Banknote} iconColor="#00C851" value={globalBuyIn} onCommit={v => dispatch({ type: 'SET_GLOBAL_BUYIN', payload: v })} disabled={isLocked} />
        <div style={{ width: 1, height: 40, backgroundColor: 'var(--divider)' }} />
        <AmountField label="Utilidad de la caja" Icon={Building2} iconColor="#FF9500" value={utilidad} onCommit={v => dispatch({ type: 'SET_UTILIDAD', payload: v })} disabled={isLocked} />
      </div>

      {globalBuyIn > 0 && (
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Cada jugador paga {new Intl.NumberFormat('es-CL').format(globalBuyIn)} CLP al ingresar
        </p>
      )}
    </div>
  );
}
