import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCLP, formatCLPSigned } from '../utils/currency';

const WIDTH = Dimensions.get('window').width - 32;

const C = {
  bg: '#0A0A0A',
  card: '#131313',
  emerald: '#00C851',
  emeraldDim: 'rgba(0,200,81,0.15)',
  emeraldBorder: 'rgba(0,200,81,0.30)',
  crimson: '#FF3B1F',
  crimsonDim: 'rgba(255,59,31,0.15)',
  crimsonBorder: 'rgba(255,59,31,0.30)',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  text: '#F2F2F2',
  textSec: '#888888',
  textMuted: '#444444',
  divider: 'rgba(255,255,255,0.07)',
  whatsapp: '#25D366',
};

const RANK_CONFIG = [
  { medal: '🥇', color: C.gold },
  { medal: '🥈', color: C.silver },
  { medal: '🥉', color: C.bronze },
];

function getRank(idx) {
  return RANK_CONFIG[idx] || { medal: `${idx + 1}°`, color: C.textSec };
}

function PlayerRow({ player, rank }) {
  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const invested = player.buyIn + rebuysTotal;
  const pnl = player.finalChips - invested;
  const isWin = pnl >= 0;
  const { medal, color } = getRank(rank);

  const initials = player.name
    ? player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={[s.playerRow, isWin ? s.playerRowWin : s.playerRowLoss]}>
      {/* Rank + Avatar */}
      <View style={s.playerLeft}>
        <Text style={[s.rankMedal, { color }]}>{medal}</Text>
        <View style={[s.avatar, { borderColor: isWin ? C.emerald : C.crimson }]}>
          <Text style={[s.avatarText, { color: isWin ? C.emerald : C.crimson }]}>{initials}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={s.playerMid}>
        <Text style={s.playerName}>{player.name || 'Jugador'}</Text>
        <View style={s.flowRow}>
          <View style={s.flowBox}>
            <Text style={s.flowLabel}>Invirtió</Text>
            <Text style={s.flowValue}>{formatCLP(invested)}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={14} color={C.textMuted} />
          <View style={s.flowBox}>
            <Text style={s.flowLabel}>Retira</Text>
            <Text style={s.flowValue}>{formatCLP(player.finalChips)}</Text>
          </View>
        </View>
      </View>

      {/* P&L */}
      <View style={[s.pnlBox, isWin ? s.pnlBoxWin : s.pnlBoxLoss]}>
        <Text style={s.pnlEmoji}>{isWin ? '✅' : '❌'}</Text>
        <Text style={[s.pnlAmount, { color: isWin ? C.emerald : C.crimson }]}>
          {formatCLPSigned(pnl)}
        </Text>
        <Text style={s.pnlCurrency}>CLP</Text>
      </View>
    </View>
  );
}

const Infographic = forwardRef(function Infographic({ players, sessionDate }, ref) {
  const date = sessionDate
    ? new Date(sessionDate).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-CL');

  const totalPot = players.reduce((sum, p) => {
    return sum + p.buyIn + p.rebuys.reduce((s, r) => s + r.amount, 0);
  }, 0);

  const sorted = [...players].sort((a, b) => {
    const pnlA = a.finalChips - (a.buyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
    const pnlB = b.finalChips - (b.buyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
    return pnlB - pnlA;
  });

  const winner = sorted[0];
  const winnerPnl = winner
    ? winner.finalChips - (winner.buyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0))
    : 0;

  return (
    <View ref={ref} style={s.root} collapsable={false}>

      {/* Barra superior esmeralda */}
      <View style={s.topBar} />

      {/* Encabezado */}
      <View style={s.header}>
        <View style={s.headerIconRow}>
          <Text style={s.headerIcon}>🎰</Text>
          <View>
            <Text style={s.headerTitle}>RESUMEN DE SESIÓN</Text>
            <Text style={s.headerSub}>Poker Night</Text>
          </View>
        </View>
        <View style={s.dateBadge}>
          <Text style={s.dateText}>📅 {date}</Text>
        </View>
      </View>

      {/* Pot total */}
      <View style={s.potSection}>
        <Text style={s.potLabel}>💰  POT TOTAL</Text>
        <Text style={s.potAmount}>{formatCLP(totalPot)}</Text>
        <Text style={s.potCurrency}>CLP · {players.length} jugadores</Text>
      </View>

      <View style={s.divider} />

      {/* Jugadores */}
      <View style={s.playersSection}>
        {sorted.map((player, idx) => (
          <PlayerRow key={player.id} player={player} rank={idx} />
        ))}
      </View>

      <View style={s.divider} />

      {/* Ganador destacado (si hay más de 1 jugador) */}
      {players.length > 1 && winnerPnl > 0 && (
        <View style={s.winnerBanner}>
          <Text style={s.winnerText}>
            🏆  {winner.name} gana {formatCLP(winnerPnl)} CLP esta noche
          </Text>
        </View>
      )}

      {/* Status de mesa cuadrada */}
      <View style={s.statusRow}>
        <MaterialCommunityIcons name="check-decagram" size={16} color={C.emerald} />
        <Text style={s.statusText}>Mesa Cuadrada Correctamente</Text>
      </View>

      {/* Branding */}
      <View style={s.brandRow}>
        <Text style={s.brandSuit}>♠</Text>
        <Text style={s.brandText}>POKER ADMIN</Text>
        <Text style={s.brandSuit}>♠</Text>
      </View>

    </View>
  );
});

export default Infographic;

const s = StyleSheet.create({
  root: {
    width: WIDTH,
    backgroundColor: C.bg,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topBar: {
    height: 4,
    backgroundColor: C.emerald,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
    letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 11,
    color: C.textSec,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  dateText: {
    fontSize: 11,
    color: C.textSec,
    fontWeight: '600',
  },

  // Pot
  potSection: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(0,200,81,0.07)',
    marginHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.emeraldBorder,
  },
  potLabel: {
    fontSize: 10,
    color: C.textSec,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  potAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: C.emerald,
    letterSpacing: -0.5,
  },
  potCurrency: {
    fontSize: 10,
    color: C.textSec,
    marginTop: 2,
    letterSpacing: 1,
  },

  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginHorizontal: 14,
    marginBottom: 12,
  },

  // Jugadores
  playersSection: {
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  playerRowWin: {
    backgroundColor: C.emeraldDim,
    borderColor: C.emeraldBorder,
  },
  playerRowLoss: {
    backgroundColor: C.crimsonDim,
    borderColor: C.crimsonBorder,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankMedal: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playerMid: {
    flex: 1,
    gap: 4,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.3,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flowBox: {
    alignItems: 'center',
  },
  flowLabel: {
    fontSize: 8,
    color: C.textMuted,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  flowValue: {
    fontSize: 11,
    color: C.textSec,
    fontWeight: '700',
  },
  pnlBox: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 6,
    minWidth: 72,
    borderWidth: 1,
  },
  pnlBoxWin: {
    backgroundColor: C.emeraldDim,
    borderColor: C.emeraldBorder,
  },
  pnlBoxLoss: {
    backgroundColor: C.crimsonDim,
    borderColor: C.crimsonBorder,
  },
  pnlEmoji: {
    fontSize: 11,
    marginBottom: 1,
  },
  pnlAmount: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  pnlCurrency: {
    fontSize: 8,
    color: C.textMuted,
    letterSpacing: 0.8,
    fontWeight: '600',
  },

  // Winner banner
  winnerBanner: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: 10,
    marginHorizontal: 14,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 12,
    color: C.gold,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 12,
    color: C.emerald,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Branding
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 14,
  },
  brandSuit: {
    fontSize: 12,
    color: C.textMuted,
  },
  brandText: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
});
