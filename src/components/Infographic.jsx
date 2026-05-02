import React, { forwardRef } from 'react';
import { formatCLP, formatCLPSigned } from '../utils/currency.js';

const C = {
  bg: '#0A0A0A', emerald: '#00C851', emeraldDim: 'rgba(0,200,81,0.13)',
  emeraldBorder: 'rgba(0,200,81,0.28)', crimson: '#FF3B1F',
  crimsonDim: 'rgba(255,59,31,0.13)', crimsonBorder: 'rgba(255,59,31,0.28)',
  gold: '#FFD700', goldDim: 'rgba(255,215,0,0.10)', goldBorder: 'rgba(255,215,0,0.28)',
  silver: '#C0C0C0', bronze: '#CD7F32', text: '#F2F2F2', textSec: '#888888',
  textMuted: '#3A3A3A', divider: 'rgba(255,255,255,0.06)',
};

const RANKS = [
  { medal: '🥇', color: C.gold }, { medal: '🥈', color: C.silver }, { medal: '🥉', color: C.bronze },
];
const getRank = (i) => RANKS[i] || { medal: `${i + 1}°`, color: C.textSec };

function PlayerRow({ player, rank, globalBuyIn, depositoCajaPorJugador }) {
  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const invested = globalBuyIn + rebuysTotal;
  const pnl = player.finalChips - invested;
  const isWin = pnl >= 0;
  const { medal, color } = getRank(rank);
  const initials = player.name ? player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', alignItems: 'center', borderRadius: 10, border: `1px solid ${isWin ? C.emeraldBorder : C.crimsonBorder}`, padding: 9, gap: 8, backgroundColor: isWin ? C.emeraldDim : C.crimsonDim, marginBottom: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 15, width: 20, textAlign: 'center', color }}>{medal}</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: `1.5px solid ${isWin ? C.emerald : C.crimson}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {player.photo
            ? <img src={player.photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 11, fontWeight: 900, color: isWin ? C.emerald : C.crimson }}>{initials}</span>}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{player.name || 'Jugador'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: C.textSec, fontWeight: 600 }}>{formatCLP(invested)}</span>
          <span style={{ fontSize: 10, color: C.textMuted }}>→</span>
          <span style={{ fontSize: 10, color: C.textSec, fontWeight: 600 }}>{formatCLP(player.finalChips)}</span>
        </div>
        {depositoCajaPorJugador !== 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: isWin ? C.emerald : C.crimson }}>
            {isWin ? '💳 Caja deposita: ' : '💳 Paga a caja: '}{formatCLP(Math.abs(depositoCajaPorJugador))}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 7, padding: 6, minWidth: 68, border: `1px solid ${isWin ? C.emeraldBorder : C.crimsonBorder}`, backgroundColor: isWin ? C.emeraldDim : C.crimsonDim }}>
        <span style={{ fontSize: 10, marginBottom: 1 }}>{isWin ? '✅' : '❌'}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: isWin ? C.emerald : C.crimson }}>{formatCLPSigned(pnl)}</span>
      </div>
    </div>
  );
}

const Infographic = forwardRef(function Infographic({ players, sessionDate, globalBuyIn = 0, utilidad = 0 }, ref) {
  const date = sessionDate
    ? new Date(sessionDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-CL');

  const totalRebuys = players.reduce((sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0), 0);
  const totalPot = globalBuyIn * players.length + totalRebuys;
  const depositoCajaTotal = Math.max(0, totalPot - utilidad);

  const sorted = [...players].sort((a, b) => {
    const pnlA = a.finalChips - (globalBuyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
    const pnlB = b.finalChips - (globalBuyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
    return pnlB - pnlA;
  });

  const winner = sorted[0];
  const winnerPnl = winner ? winner.finalChips - (globalBuyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0)) : 0;
  const depositoPorJugador = (p) => p.finalChips - (globalBuyIn + p.rebuys.reduce((s, r) => s + r.amount, 0));

  return (
    <div ref={ref} style={{ width: 340, backgroundColor: C.bg, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 4, backgroundColor: C.emerald }} />

      {/* Header */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>🎰</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 900, color: C.text, letterSpacing: 1.5, margin: 0 }}>RESUMEN DE SESIÓN</p>
          <p style={{ fontSize: 11, color: C.textSec, fontWeight: 500, margin: '1px 0 0' }}>Poker Night · {date}</p>
        </div>
      </div>

      {/* Totals */}
      <div style={{ margin: '0 14px 12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
          <span style={{ fontSize: 10, color: C.textSec, fontWeight: 700, letterSpacing: 0.8 }}>💰 POT TOTAL</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{formatCLP(totalPot)} CLP</span>
        </div>
        {utilidad > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderTop: `1px solid ${C.divider}` }}>
            <span style={{ fontSize: 10, color: C.textSec, fontWeight: 700, letterSpacing: 0.8 }}>🏦 UTILIDAD CAJA</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{formatCLP(utilidad)} CLP</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderTop: `1px solid ${C.divider}`, backgroundColor: 'rgba(0,200,81,0.13)' }}>
          <span style={{ fontSize: 10, color: C.emerald, fontWeight: 700, letterSpacing: 0.8 }}>💳 DEPÓSITO CAJA TOTAL</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.emerald }}>{formatCLP(depositoCajaTotal)} CLP</span>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: C.divider, margin: '0 14px 10px' }} />

      {/* Players */}
      <div style={{ padding: '0 14px', marginBottom: 10 }}>
        {sorted.map((p, i) => <PlayerRow key={p.id} player={p} rank={i} globalBuyIn={globalBuyIn} depositoCajaPorJugador={depositoPorJugador(p)} />)}
      </div>

      <div style={{ height: 1, backgroundColor: C.divider, margin: '0 14px 10px' }} />

      {/* Winner */}
      {players.length > 1 && winnerPnl > 0 && (
        <div style={{ backgroundColor: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 8, margin: '0 14px 10px', padding: '8px 12px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>🏆 {winner.name} gana {formatCLP(winnerPnl)} CLP esta noche</span>
        </div>
      )}

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: C.emerald, fontWeight: 700 }}>✔ Mesa Cuadrada Correctamente</span>
      </div>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, paddingBottom: 12 }}>
        <span style={{ fontSize: 10, color: C.textMuted }}>♠</span>
        <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 800, letterSpacing: 2.5 }}>POKER ADMIN</span>
        <span style={{ fontSize: 10, color: C.textMuted }}>♠</span>
      </div>
    </div>
  );
});

export default Infographic;
