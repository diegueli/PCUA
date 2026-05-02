import React, { forwardRef } from 'react';
import { formatCLP, formatCLPSigned } from '../utils/currency.js';

const C = {
  bg: '#0A0A0A', emerald: '#00C851', emeraldDim: 'rgba(0,200,81,0.13)',
  emeraldBorder: 'rgba(0,200,81,0.28)', crimson: '#FF3B1F',
  crimsonDim: 'rgba(255,59,31,0.13)', crimsonBorder: 'rgba(255,59,31,0.28)',
  gold: '#FFD700', goldDim: 'rgba(255,215,0,0.10)', goldBorder: 'rgba(255,215,0,0.28)',
  silver: '#C0C0C0', bronze: '#CD7F32', text: '#F2F2F2', textSec: '#888888',
  textMuted: '#404040', divider: 'rgba(255,255,255,0.07)',
};

const RANKS = [
  { medal: '🥇', color: C.gold },
  { medal: '🥈', color: C.silver },
  { medal: '🥉', color: C.bronze },
];
const getRank = (i) => RANKS[i] || { medal: `${i + 1}°`, color: C.textSec };

// Celda de métrica
function MetricCell({ label, value, color, bg, border, align = 'center' }) {
  return (
    <div style={{ flex: 1, backgroundColor: bg || 'rgba(255,255,255,0.03)', border: `1px solid ${border || 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '5px 6px', textAlign: align }}>
      <p style={{ fontSize: 8, fontWeight: 700, color: C.textSec, letterSpacing: 0.8, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 800, color: color || C.text }}>{value}</p>
    </div>
  );
}

function PlayerRow({ player, rank, globalBuyIn }) {
  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const compras = globalBuyIn + rebuysTotal;
  const totalFichas = player.finalChips;
  const utilidad = totalFichas - compras;
  const isWin = utilidad >= 0;
  const { medal, color } = getRank(rank);
  const initials = player.name ? player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div style={{ marginBottom: 8, borderRadius: 10, border: `1px solid ${isWin ? C.emeraldBorder : C.crimsonBorder}`, overflow: 'hidden', backgroundColor: isWin ? C.emeraldDim : C.crimsonDim }}>
      {/* Nombre + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px 4px' }}>
        <span style={{ fontSize: 14, color, minWidth: 20, textAlign: 'center' }}>{medal}</span>
        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', border: `1.5px solid ${isWin ? C.emerald : C.crimson}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {player.photo
            ? <img src={player.photo} alt="" style={{ width: 28, height: 28, objectFit: 'cover' }} />
            : <span style={{ fontSize: 10, fontWeight: 900, color: isWin ? C.emerald : C.crimson }}>{initials}</span>}
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.text, flex: 1 }}>{player.name || 'Jugador'}</span>
        <span style={{ fontSize: 16 }}>{isWin ? '✅' : '❌'}</span>
      </div>

      {/* 3 columnas: Compras / Total Fichas / Utilidad */}
      <div style={{ display: 'flex', gap: 4, padding: '0 8px 7px' }}>
        <MetricCell label="COMPRAS" value={formatCLP(compras)} color={C.textSec} />
        <MetricCell label="TOTAL FICHAS" value={formatCLP(totalFichas)} color={C.text} />
        <MetricCell
          label="UTILIDAD"
          value={formatCLPSigned(utilidad)}
          color={isWin ? C.emerald : C.crimson}
          bg={isWin ? 'rgba(0,200,81,0.10)' : 'rgba(255,59,31,0.10)'}
          border={isWin ? C.emeraldBorder : C.crimsonBorder}
        />
      </div>
    </div>
  );
}

const Infographic = forwardRef(function Infographic({ players, sessionDate, globalBuyIn = 0 }, ref) {
  const date = sessionDate
    ? new Date(sessionDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-CL');

  const totalRebuys = players.reduce((sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0), 0);
  const totalPot = globalBuyIn * players.length + totalRebuys;

  const sorted = [...players].sort((a, b) => {
    const ua = a.finalChips - (globalBuyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
    const ub = b.finalChips - (globalBuyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
    return ub - ua;
  });

  const winner = sorted[0];
  const winnerUtil = winner ? winner.finalChips - (globalBuyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0)) : 0;

  return (
    <div ref={ref} style={{ width: 340, backgroundColor: C.bg, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Barra superior */}
      <div style={{ height: 4, backgroundColor: C.emerald }} />

      {/* Header */}
      <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.divider}` }}>
        <span style={{ fontSize: 28 }}>🎰</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 900, color: C.text, letterSpacing: 1.5, margin: 0 }}>RESUMEN DE SESIÓN</p>
          <p style={{ fontSize: 11, color: C.textSec, fontWeight: 500, margin: '2px 0 0' }}>Poker Night · {date}</p>
        </div>
        {/* Pot total badge */}
        <div style={{ backgroundColor: 'rgba(0,200,81,0.12)', border: `1px solid ${C.emeraldBorder}`, borderRadius: 10, padding: '6px 10px', textAlign: 'center' }}>
          <p style={{ fontSize: 8, color: C.textSec, fontWeight: 700, letterSpacing: 0.8, margin: 0 }}>POT TOTAL</p>
          <p style={{ fontSize: 14, fontWeight: 900, color: C.emerald, margin: '2px 0 0' }}>{formatCLP(totalPot)}</p>
          <p style={{ fontSize: 8, color: C.textMuted, letterSpacing: 0.5, margin: 0 }}>{players.length} jugadores</p>
        </div>
      </div>

      {/* Jugadores */}
      <div style={{ padding: '10px 12px 4px' }}>
        {sorted.map((p, i) => (
          <PlayerRow key={p.id} player={p} rank={i} globalBuyIn={globalBuyIn} />
        ))}
      </div>

      {/* Winner banner */}
      {players.length > 1 && winnerUtil > 0 && (
        <div style={{ backgroundColor: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 8, margin: '0 12px 10px', padding: '8px 12px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}>🏆 {winner.name} gana {formatCLP(winnerUtil)} CLP esta noche</span>
        </div>
      )}

      {/* Estado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: C.emerald, fontWeight: 700 }}>✔ Mesa Cuadrada Correctamente</span>
      </div>

      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 12 }}>
        <span style={{ fontSize: 10, color: C.textMuted }}>♠</span>
        <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 800, letterSpacing: 2.5 }}>POKER ADMIN</span>
        <span style={{ fontSize: 10, color: C.textMuted }}>♠</span>
      </div>
    </div>
  );
});

export default Infographic;
