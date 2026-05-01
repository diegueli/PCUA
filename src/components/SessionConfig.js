import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useSession } from '../context/SessionContext';

function AmountField({ label, icon, iconColor, value, onCommit, disabled }) {
  const [raw, setRaw] = useState(value > 0 ? value.toString() : '');

  useEffect(() => {
    setRaw(value > 0 ? value.toString() : '');
  }, [value]);

  const handleChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setRaw(clean);
  };

  const handleBlur = () => {
    onCommit(parseInt(raw) || 0);
  };

  return (
    <View style={s.field}>
      <View style={s.fieldLabelRow}>
        <MaterialCommunityIcons name={icon} size={14} color={iconColor} />
        <Text style={[s.fieldLabel, { color: iconColor }]}>{label}</Text>
      </View>
      <View style={s.inputRow}>
        <Text style={s.prefix}>$</Text>
        <TextInput
          style={[s.input, disabled && s.inputDisabled]}
          value={raw}
          onChangeText={handleChange}
          onBlur={handleBlur}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          editable={!disabled}
          maxLength={9}
          allowFontScaling={false}
        />
        <Text style={s.suffix}>CLP</Text>
      </View>
    </View>
  );
}

export default function SessionConfig() {
  const { state, dispatch } = useSession();
  const { globalBuyIn, utilidad, sessionState } = state;
  const isLocked = sessionState !== 'OPEN';

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <MaterialCommunityIcons name="table-chair" size={16} color={COLORS.emerald} />
        <Text style={s.cardTitle}>CONFIGURACIÓN DE MESA</Text>
        {isLocked && (
          <View style={s.lockedBadge}>
            <MaterialCommunityIcons name="lock" size={10} color={COLORS.warning} />
            <Text style={s.lockedText}>Bloqueada</Text>
          </View>
        )}
      </View>

      <View style={s.fields}>
        <AmountField
          label="Buy-in (igual para todos)"
          icon="cash-multiple"
          iconColor={COLORS.emerald}
          value={globalBuyIn}
          onCommit={v => dispatch({ type: 'SET_GLOBAL_BUYIN', payload: v })}
          disabled={isLocked}
        />
        <View style={s.fieldDivider} />
        <AmountField
          label="Utilidad de la caja"
          icon="bank"
          iconColor={COLORS.warning}
          value={utilidad}
          onCommit={v => dispatch({ type: 'SET_UTILIDAD', payload: v })}
          disabled={isLocked}
        />
      </View>

      {globalBuyIn > 0 && (
        <Text style={s.hint}>
          Cada jugador paga {
            new Intl.NumberFormat('es-CL').format(globalBuyIn)
          } CLP al ingresar
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardTitle: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1.5,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.warningGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  lockedText: {
    fontSize: 9,
    color: COLORS.warning,
    fontWeight: '700',
  },
  fields: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  field: {
    flex: 1,
    gap: 4,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassMedium,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  prefix: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  inputDisabled: {
    color: COLORS.textSecondary,
  },
  suffix: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  fieldDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
