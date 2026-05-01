import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SESSION_STATE_LABELS, SESSION_STATE_COLORS } from '../constants/theme';
import { formatCLP } from '../utils/currency';
import { useSession, computeSessionStats } from '../context/SessionContext';

export default function DataIntegrityHeader() {
  const { state, dispatch } = useSession();
  const { sessionState, players, sessionDate, globalBuyIn } = state;
  const { confirmedPot, unconfirmedDebt } = computeSessionStats(state);

  const stateColor = SESSION_STATE_COLORS[sessionState];
  const stateLabel = SESSION_STATE_LABELS[sessionState];
  const date = new Date(sessionDate).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Barra superior: título + estado + reset */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons name="cards-playing" size={22} color={COLORS.emerald} />
          <Text style={styles.title}>POKER ADMIN</Text>
        </View>

        <View style={[styles.stateBadge, { borderColor: stateColor }]}>
          <View style={[styles.stateDot, { backgroundColor: stateColor }]} />
          <Text style={[styles.stateLabel, { color: stateColor }]}>{stateLabel}</Text>
        </View>
      </View>

      <Text style={styles.dateText}>{date}</Text>

      {/* Métricas de integridad */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, styles.metricCardEmerald]}>
          <Text style={styles.metricLabel}>POT CONFIRMADO</Text>
          <Text style={[styles.metricAmount, { color: COLORS.emerald }]}>
            {formatCLP(confirmedPot)}
          </Text>
          <Text style={styles.metricSub}>CLP</Text>
        </View>

        <View style={styles.syncIconWrapper}>
          <MaterialCommunityIcons
            name="sync"
            size={24}
            color={unconfirmedDebt > 0 ? COLORS.crimsonLight : COLORS.textMuted}
          />
        </View>

        <View style={[styles.metricCard, unconfirmedDebt > 0 ? styles.metricCardCrimson : styles.metricCardNeutral]}>
          <Text style={styles.metricLabel}>DEUDA PENDIENTE</Text>
          <Text style={[styles.metricAmount, { color: unconfirmedDebt > 0 ? COLORS.crimsonLight : COLORS.textMuted }]}>
            {formatCLP(unconfirmedDebt)}
          </Text>
          <Text style={styles.metricSub}>CLP</Text>
        </View>
      </View>

      {/* Controles de estado de sesión */}
      <SessionStateControls
        sessionState={sessionState}
        dispatch={dispatch}
        players={players}
      />
    </View>
  );
}

function SessionStateControls({ sessionState, dispatch, players }) {
  if (sessionState === 'OPEN') {
    return (
      <TouchableOpacity
        style={styles.stateBtn}
        onPress={() => dispatch({ type: 'SET_SESSION_STATE', payload: 'LOCKED' })}
      >
        <MaterialCommunityIcons name="lock" size={14} color={COLORS.warning} />
        <Text style={[styles.stateBtnText, { color: COLORS.warning }]}>Bloquear para contar fichas</Text>
      </TouchableOpacity>
    );
  }

  if (sessionState === 'LOCKED') {
    return (
      <View style={styles.stateControlRow}>
        <TouchableOpacity
          style={[styles.stateBtn, styles.stateBtnHalf]}
          onPress={() => dispatch({ type: 'SET_SESSION_STATE', payload: 'OPEN' })}
        >
          <MaterialCommunityIcons name="lock-open" size={14} color={COLORS.textSecondary} />
          <Text style={[styles.stateBtnText, { color: COLORS.textSecondary }]}>Re-abrir mesa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stateBtn, styles.stateBtnHalf, { borderColor: COLORS.emeraldBorder }]}
          onPress={() => dispatch({ type: 'SET_SESSION_STATE', payload: 'SETTLED' })}
        >
          <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.emerald} />
          <Text style={[styles.stateBtnText, { color: COLORS.emerald }]}>Liquidar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.settledBanner]}>
      <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.emerald} />
      <Text style={[styles.stateBtnText, { color: COLORS.emerald }]}>Sesión liquidada</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  stateDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
  },
  stateLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resetBtn: {
    padding: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  metricCardEmerald: {
    backgroundColor: COLORS.emeraldGlow,
    borderColor: COLORS.emeraldBorder,
  },
  metricCardCrimson: {
    backgroundColor: COLORS.crimsonGlow,
    borderColor: COLORS.crimsonBorder,
  },
  metricCardNeutral: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassBorder,
  },
  syncIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  metricAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  stateControlRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  stateBtnHalf: {
    flex: 1,
  },
  stateBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  settledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.emeraldGlow,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
  },
});
