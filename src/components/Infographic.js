import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCLP, formatCLPSigned } from '../utils/currency';

const WIDTH = Math.min(Dimensions.get('window').width - 32, 380);

const C = {
  bg: '#0A0A0A',
  emerald: '#00C851',
  emeraldDim: 'rgba(0,200,81,0.13)',
  emeraldBorder: 'rgba(0,200,81,0.28)',
  crimson: '#FF3B1F',
  crimsonDim: 'rgba(255,59,31,0.13)',
  crimsonBorder: 'rgba(255,59,31,0.28)',
  gold: '#FFD700',
  goldDim: 'rgba(255,215,0,0.10)',
  goldBorder: 'rgba(255,215,0,0.28)',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  warning: '#FF9500',
  warningDim: 'rgba(255,149,0,0.12)',
  warningBorder: 'rgba(255,149,0,0.30)',
  text: '#F2F2F2',
  textSec: '#888888',
  textMuted: '#3A3A3A',
  divider: 'rgba(255,255,255,0.06)',
};

const RANK_CONFIG = [
  { medal: '🥇', color: C.gold },
  { medal: '🥈', color: C.silver },
  { medal: '🥉', color: C.bronze },
];
function getRank(idx) {
  return RANK_CONFIG[idx] || { medal: `${idx + 1}°`, color: C.textSec };
}

// ---------------------------------------------------------------------------
// Fila de jugador
// ---------------------------------------------------------------------------
function PlayerRow({ player, rank, globalBuyIn, depositoCajaPorJugador }) {
  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const invested = globalBuyIn + rebuysTotal;
  const pnl = player.finalChips - invested;
  const isWin = pnl >= 0;
  const { medal, color } = getRank(rank);

  const initials = player.name
    ? player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={[p.row, isWin ? p.rowWin : p.rowLoss]}>
      {/* Izquierda: rank + avatar */}
      <View style={p.left}>
        <Text style={[p.medal, { color }]}>{medal}</Text>
        <View style={[p.avatar, { borderColor: isWin ? C.emerald : C.crimson }]}>
          <Text style={[p.avatarText, { color: isWin ? C.emerald : C.crimson }]}>{initials}</Text>
        </View>
      </View>

      {/* Centro: nombre + flujo */}
      <View style={p.mid}>
        <Text style={p.name} numberOfLines={1}>{player.name || 'Jugador'}</Text>
        <View style={p.flow}>
          <Text style={p.flowVal}>{formatCLP(invested)}</Text>
          <MaterialCommunityIcons name="arrow-right-thin" size={12} color={C.textMuted} />
          <Text style={p.flowVal}>{formatCLP(player.finalChips)}</Text>
        </View>
        {/* Depósito que recibe/paga a la caja */}
        {depositoCajaPorJugador !== 0 && (
          <Text style={[p.deposito, { color: isWin ? C.emerald : C.crimson }]}>
            {isWin ? '💳 Caja deposita: ' : '💳 Paga a caja: '}
            {formatCLP(Math.abs(depositoCajaPorJugador))}
          </Text>
        )}
      </View>

      {/* Derecha: P&L */}
      <View style={[p.pnl, isWin ? p.pnlWin : p.pnlLoss]}>
        <Text style={p.pnlEmoji}>{isWin ? '✅' : '❌'}</Text>
        <Text style={[p.pnlAmt, { color: isWin ? C.emerald : C.crimson }]}>
          {formatCLPSigned(pnl)}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Infographic principal
// ---------------------------------------------------------------------------
const Infographic = forwardRef(function Infographic(
  { players, sessionDate, globalBuyIn = 0, utilidad = 0 },
  ref
) {
  const date = sessionDate
    ? new Date(sessionDate).toLocaleDateString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : new Date().toLocaleDateString('es-CL');

  const totalRebuys = players.reduce(
    (sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0), 0
  );
  const totalPot = globalBuyIn * players.length + totalRebuys;
  const depositoCajaTotal = Math.max(0, totalPot - utilidad);

  // Ordenar por P&L desc
  const sorted = [...players].sort((a, b) => {
    const pnlA = a.finalChips - (globalBuyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
    const pnlB = b.finalChips - (globalBuyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
    return pnlB - pnlA;
  });

  const winner = sorted[0];
  const winnerPnl = winner
    ? winner.finalChips - (globalBuyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0))
    : 0;

  // Calcular depósito de la caja por jugador:
  // Ganadores reciben (pnl positivo), perdedores pagan (pnl negativo)
  function depositoPorJugador(player) {
    const invested = globalBuyIn + player.rebuys.reduce((s, r) => s + r.amount, 0);
    return player.finalChips - invested; // positivo = caja paga, negativo = jugador paga
  }

  return (
    <View ref={ref} style={inf.root} collapsable={false}>

      {/* Barra superior */}
      <View style={inf.topBar} />

      {/* Encabezado — una sola columna para evitar overflow */}
      <View style={inf.header}>
        <View style={inf.headerRow}>
          <Text style={inf.headerIcon}>🎰</Text>
          <View style={inf.headerText}>
            <Text style={inf.headerTitle} numberOfLines={1}>RESUMEN DE SESIÓN</Text>
            <Text style={inf.headerSub} numberOfLines={1}>
              Poker Night  ·  {date}
            </Text>
          </View>
        </View>
      </View>

      {/* Totales */}
      <View style={inf.totalsBox}>
        <View style={inf.totalRow}>
          <Text style={inf.totalLabel}>💰 POT TOTAL</Text>
          <Text style={[inf.totalVal, { color: C.text }]}>{formatCLP(totalPot)} CLP</Text>
        </View>

        {utilidad > 0 && (
          <View style={[inf.totalRow, inf.totalRowSep]}>
            <Text style={inf.totalLabel}>🏦 UTILIDAD CAJA</Text>
            <Text style={[inf.totalVal, { color: C.gold }]}>{formatCLP(utilidad)} CLP</Text>
          </View>
        )}

        <View style={[inf.totalRow, inf.totalRowHighlight]}>
          <Text style={[inf.totalLabel, { color: C.emerald }]}>💳 DEPÓSITO CAJA TOTAL</Text>
          <Text style={[inf.totalVal, { color: C.emerald }]}>{formatCLP(depositoCajaTotal)} CLP</Text>
        </View>
      </View>

      <View style={inf.divider} />

      {/* Jugadores */}
      <View style={inf.players}>
        {sorted.map((player, idx) => (
          <PlayerRow
            key={player.id}
            player={player}
            rank={idx}
            globalBuyIn={globalBuyIn}
            depositoCajaPorJugador={depositoPorJugador(player)}
          />
        ))}
      </View>

      <View style={inf.divider} />

      {/* Banner ganador */}
      {players.length > 1 && winnerPnl > 0 && (
        <View style={inf.winnerBanner}>
          <Text style={inf.winnerText}>
            🏆  {winner.name} gana {formatCLP(winnerPnl)} CLP esta noche
          </Text>
        </View>
      )}

      {/* Estado cuadre */}
      <View style={inf.statusRow}>
        <MaterialCommunityIcons name="check-decagram" size={14} color={C.emerald} />
        <Text style={inf.statusText}>Mesa Cuadrada Correctamente</Text>
      </View>

      {/* Branding */}
      <View style={inf.brand}>
        <Text style={inf.brandSuit}>♠</Text>
        <Text style={inf.brandText}>POKER ADMIN</Text>
        <Text style={inf.brandSuit}>♠</Text>
      </View>
    </View>
  );
});

export default Infographic;

// ---------------------------------------------------------------------------
// Estilos infografía
// ---------------------------------------------------------------------------
const inf = StyleSheet.create({
  root: {
    width: WIDTH,
    backgroundColor: C.bg,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  topBar: { height: 4, backgroundColor: C.emerald },

  // Header — columna única, sin riesgo de overflow
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: { fontSize: 26 },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 13, fontWeight: '900',
    color: C.text, letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 11, color: C.textSec,
    fontWeight: '500', marginTop: 1,
  },

  // Totales
  totalsBox: {
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  totalRowSep: {
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  totalRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.emeraldDim,
  },
  totalLabel: {
    fontSize: 10, color: C.textSec,
    fontWeight: '700', letterSpacing: 0.8,
  },
  totalVal: {
    fontSize: 13, fontWeight: '800',
  },

  divider: { height: 1, backgroundColor: C.divider, marginHorizontal: 14, marginBottom: 10 },

  // Jugadores
  players: { paddingHorizontal: 14, gap: 7, marginBottom: 10 },

  // Winner
  winnerBanner: {
    backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.goldBorder,
    borderRadius: 8, marginHorizontal: 14,
    marginBottom: 10, paddingVertical: 8,
    paddingHorizontal: 12, alignItems: 'center',
  },
  winnerText: {
    fontSize: 11, color: C.gold,
    fontWeight: '700', textAlign: 'center',
  },

  // Status
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5, marginBottom: 10,
  },
  statusText: { fontSize: 11, color: C.emerald, fontWeight: '700' },

  // Brand
  brand: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7, paddingBottom: 12,
  },
  brandSuit: { fontSize: 10, color: C.textMuted },
  brandText: { fontSize: 9, color: C.textMuted, fontWeight: '800', letterSpacing: 2.5 },
});

// ---------------------------------------------------------------------------
// Estilos filas de jugador
// ---------------------------------------------------------------------------
const p = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, padding: 9, gap: 8,
  },
  rowWin: { backgroundColor: C.emeraldDim, borderColor: C.emeraldBorder },
  rowLoss: { backgroundColor: C.crimsonDim, borderColor: C.crimsonBorder },
  left: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  medal: { fontSize: 15, width: 20, textAlign: 'center' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '900' },
  mid: { flex: 1, gap: 2 },
  name: { fontSize: 12, fontWeight: '800', color: C.text },
  flow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flowVal: { fontSize: 10, color: C.textSec, fontWeight: '600' },
  deposito: { fontSize: 9, fontWeight: '700', marginTop: 1 },
  pnl: {
    alignItems: 'center', borderRadius: 7,
    padding: 6, minWidth: 68, borderWidth: 1,
  },
  pnlWin: { backgroundColor: C.emeraldDim, borderColor: C.emeraldBorder },
  pnlLoss: { backgroundColor: C.crimsonDim, borderColor: C.crimsonBorder },
  pnlEmoji: { fontSize: 10, marginBottom: 1 },
  pnlAmt: { fontSize: 11, fontWeight: '900' },
});
