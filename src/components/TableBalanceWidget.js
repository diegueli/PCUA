import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { formatCLP } from '../utils/currency';
import { useSession, computeSessionStats } from '../context/SessionContext';

export default function TableBalanceWidget() {
  const { state } = useSession();
  const { players } = state;
  const { totalInvested, totalFinalChips, discrepancy, isBalanced } = computeSessionStats(players);

  const hasData = players.length > 0;

  if (!hasData) return null;

  return (
    <View style={[styles.container, isBalanced ? styles.containerBalanced : styles.containerUnbalanced]}>
      {/* Título */}
      <View style={styles.titleRow}>
        <MaterialCommunityIcons
          name={isBalanced ? 'scale-balance' : 'alert-rhombus'}
          size={18}
          color={isBalanced ? COLORS.emerald : COLORS.crimsonLight}
        />
        <Text style={[styles.title, { color: isBalanced ? COLORS.emerald : COLORS.crimsonLight }]}>
          BALANCE DE MESA
        </Text>
      </View>

      {/* Ecuación visual */}
      <View style={styles.equation}>
        <View style={styles.equationSide}>
          <Text style={styles.equationLabel}>Σ Entradas</Text>
          <Text style={[styles.equationValue, { color: COLORS.textPrimary }]}>
            {formatCLP(totalInvested)}
          </Text>
          <Text style={styles.equationSub}>CLP</Text>
        </View>

        <View style={styles.equationOp}>
          <Text style={[styles.equationOpText, { color: isBalanced ? COLORS.emerald : COLORS.crimsonLight }]}>
            {isBalanced ? '=' : '≠'}
          </Text>
        </View>

        <View style={styles.equationSide}>
          <Text style={styles.equationLabel}>Σ Fichas Finales</Text>
          <Text style={[styles.equationValue, { color: COLORS.textPrimary }]}>
            {formatCLP(totalFinalChips)}
          </Text>
          <Text style={styles.equationSub}>CLP</Text>
        </View>
      </View>

      {/* Estado */}
      {isBalanced ? (
        <View style={styles.balancedBanner}>
          <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.emerald} />
          <Text style={styles.balancedText}>Mesa Cuadrada — Lista para liquidar</Text>
        </View>
      ) : (
        <View style={styles.discrepancyBanner}>
          <MaterialCommunityIcons name="alert" size={16} color={COLORS.crimsonLight} />
          <Text style={styles.discrepancyText}>
            Descuadre: {formatCLP(Math.abs(discrepancy))} CLP
            {discrepancy > 0 ? ' (faltan fichas)' : ' (sobran fichas)'}
          </Text>
        </View>
      )}

      {/* Barra de progreso del cuadre */}
      {totalInvested > 0 && (
        <BalanceProgressBar
          totalInvested={totalInvested}
          totalFinalChips={totalFinalChips}
          isBalanced={isBalanced}
        />
      )}
    </View>
  );
}

function BalanceProgressBar({ totalInvested, totalFinalChips, isBalanced }) {
  const ratio = totalInvested > 0 ? Math.min(totalFinalChips / totalInvested, 1.5) : 0;
  const widthPct = `${Math.min(ratio * 100, 100)}%`;
  const overflow = totalFinalChips > totalInvested;

  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Cobertura de fichas</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: widthPct, backgroundColor: isBalanced ? COLORS.emerald : overflow ? COLORS.warning : COLORS.crimsonLight },
          ]}
        />
        <View style={styles.progressTarget} />
      </View>
      <Text style={[styles.progressPct, { color: isBalanced ? COLORS.emerald : COLORS.crimsonLight }]}>
        {Math.round(ratio * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  containerBalanced: {
    backgroundColor: COLORS.emeraldGlow,
    borderColor: COLORS.emeraldBorder,
  },
  containerUnbalanced: {
    backgroundColor: COLORS.crimsonGlow,
    borderColor: COLORS.crimsonBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  equation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  equationSide: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  equationLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  equationValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  equationSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  equationOp: {
    width: 32,
    alignItems: 'center',
  },
  equationOpText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
  },
  balancedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'center',
    backgroundColor: COLORS.emeraldGlow,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  balancedText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.emerald,
    fontWeight: '700',
  },
  discrepancyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'center',
    backgroundColor: COLORS.crimsonGlow,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.crimsonBorder,
  },
  discrepancyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.crimsonLight,
    fontWeight: '700',
  },
  progressContainer: {
    gap: SPACING.xs,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressTarget: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.textMuted,
  },
  progressPct: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textAlign: 'right',
  },
});
