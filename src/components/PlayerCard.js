import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { formatCLP, formatCLPSigned } from '../utils/currency';
import { useSession } from '../context/SessionContext';

// ---------------------------------------------------------------------------
// Avatar circular (foto o iniciales)
// ---------------------------------------------------------------------------
function Avatar({ name, photo, onPress }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <TouchableOpacity onPress={onPress} style={styles.avatarContainer}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
      )}
      <View style={styles.avatarEditBadge}>
        <Ionicons name="camera" size={8} color={COLORS.textInverse} />
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Checkbox de confirmación con timestamp
// ---------------------------------------------------------------------------
function ConfirmCheckbox({ confirmed, confirmedAt, onToggle, disabled }) {
  const timeLabel = confirmedAt
    ? new Date(confirmedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onToggle}
      style={[styles.checkbox, confirmed ? styles.checkboxConfirmed : styles.checkboxPending]}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {confirmed ? (
        <MaterialCommunityIcons name="check" size={14} color={COLORS.textInverse} />
      ) : (
        <MaterialCommunityIcons name="cash" size={12} color={COLORS.crimsonLight} />
      )}
      {timeLabel ? (
        <Text style={styles.checkboxTime}>{timeLabel}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Fila de monto (buy-in / rebuy)
// ---------------------------------------------------------------------------
function AmountRow({ label, value, confirmed, confirmedAt, onChangeAmount, onToggleConfirm, onRemove, disabled }) {
  const [raw, setRaw] = useState(value > 0 ? value.toString() : '');

  const handleChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setRaw(clean);
    onChangeAmount(parseInt(clean) || 0);
  };

  const hasValue = value > 0;
  const glowing = hasValue && !confirmed;

  return (
    <View style={[styles.amountRow, glowing && styles.amountRowGlow]}>
      <Text style={styles.amountLabel}>{label}</Text>

      <View style={styles.amountInputWrapper}>
        <Text style={styles.currencyPrefix}>$</Text>
        <TextInput
          style={[styles.amountInput, disabled && styles.inputDisabled]}
          value={raw}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          editable={!disabled}
          maxLength={9}
          allowFontScaling={false}
        />
        <Text style={styles.currencySuffix}>CLP</Text>
      </View>

      <ConfirmCheckbox
        confirmed={confirmed}
        confirmedAt={confirmedAt}
        onToggle={onToggleConfirm}
        disabled={disabled}
      />

      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Ionicons name="close" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de jugador principal
// ---------------------------------------------------------------------------
export default function PlayerCard({ player }) {
  const { dispatch, state } = useSession();
  const isLocked = state.sessionState !== 'OPEN';

  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const totalInvested = player.buyIn + rebuysTotal;
  const pnl = player.finalChips - totalInvested;
  const hasFinalChips = player.finalChips > 0;

  const hasUnconfirmed =
    (player.buyIn > 0 && !player.buyInConfirmed) ||
    player.rebuys.some(r => r.amount > 0 && !r.confirmed);

  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'photo', value: result.assets[0].uri } });
    }
  }, [player.id, dispatch]);

  const handleRemovePlayer = () => {
    Alert.alert(
      'Eliminar jugador',
      `¿Eliminar a ${player.name || 'este jugador'} de la mesa?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => dispatch({ type: 'REMOVE_PLAYER', payload: player.id }) },
      ]
    );
  };

  const [finalRaw, setFinalRaw] = useState(player.finalChips > 0 ? player.finalChips.toString() : '');

  const handleFinalChipsChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setFinalRaw(clean);
    dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'finalChips', value: parseInt(clean) || 0 } });
  };

  return (
    <View style={[styles.card, hasUnconfirmed && styles.cardWarning]}>
      {/* Cabecera: avatar + nombre + P&L */}
      <View style={styles.cardHeader}>
        <Avatar name={player.name} photo={player.photo} onPress={handlePickPhoto} />

        <View style={styles.nameBlock}>
          <TextInput
            style={styles.nameInput}
            value={player.name}
            onChangeText={text => dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'name', value: text } })}
            placeholder="Nombre del jugador"
            placeholderTextColor={COLORS.textMuted}
            editable={!isLocked}
            allowFontScaling={false}
          />
          {totalInvested > 0 && (
            <Text style={styles.investedLabel}>
              Invirtió {formatCLP(totalInvested)} CLP
            </Text>
          )}
        </View>

        {hasFinalChips && (
          <View style={[styles.pnlBadge, pnl >= 0 ? styles.pnlBadgeWin : styles.pnlBadgeLoss]}>
            <Text style={[styles.pnlText, pnl >= 0 ? styles.pnlTextWin : styles.pnlTextLoss]}>
              {formatCLPSigned(pnl)}
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={handleRemovePlayer} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Buy-in */}
      <AmountRow
        label="Buy-in"
        value={player.buyIn}
        confirmed={player.buyInConfirmed}
        confirmedAt={player.buyInConfirmedAt}
        onChangeAmount={v => dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'buyIn', value: v } })}
        onToggleConfirm={() => dispatch({ type: 'TOGGLE_BUYIN_CONFIRMED', payload: player.id })}
        disabled={isLocked}
      />

      {/* Rebuys */}
      {player.rebuys.map((rebuy, idx) => (
        <AmountRow
          key={rebuy.id}
          label={`Rebuy ${idx + 1}`}
          value={rebuy.amount}
          confirmed={rebuy.confirmed}
          confirmedAt={rebuy.confirmedAt}
          onChangeAmount={v => dispatch({ type: 'UPDATE_REBUY', payload: { playerId: player.id, rebuyId: rebuy.id, amount: v } })}
          onToggleConfirm={() => dispatch({ type: 'TOGGLE_REBUY_CONFIRMED', payload: { playerId: player.id, rebuyId: rebuy.id } })}
          onRemove={!isLocked ? () => dispatch({ type: 'REMOVE_REBUY', payload: { playerId: player.id, rebuyId: rebuy.id } }) : null}
          disabled={isLocked}
        />
      ))}

      {/* Botón agregar rebuy */}
      {!isLocked && (
        <TouchableOpacity
          style={styles.addRebuyBtn}
          onPress={() => dispatch({ type: 'ADD_REBUY', payload: player.id })}
        >
          <Ionicons name="add-circle-outline" size={15} color={COLORS.emerald} />
          <Text style={styles.addRebuyText}>Agregar Rebuy</Text>
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {/* Fichas finales */}
      <View style={styles.finalRow}>
        <MaterialCommunityIcons name="poker-chip" size={18} color={COLORS.warning} />
        <Text style={styles.finalLabel}>Fichas Finales</Text>
        <View style={styles.finalInputWrapper}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={finalRaw}
            onChangeText={handleFinalChipsChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            maxLength={9}
            allowFontScaling={false}
          />
          <Text style={styles.currencySuffix}>CLP</Text>
        </View>
      </View>

      {/* Resultado neto */}
      {hasFinalChips && totalInvested > 0 && (
        <View style={[styles.netResult, pnl >= 0 ? styles.netResultWin : styles.netResultLoss]}>
          <MaterialCommunityIcons
            name={pnl >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={pnl >= 0 ? COLORS.emerald : COLORS.crimsonLight}
          />
          <Text style={[styles.netResultText, pnl >= 0 ? styles.netResultTextWin : styles.netResultTextLoss]}>
            Resultado Neto: {formatCLPSigned(pnl)} CLP
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardWarning: {
    borderColor: COLORS.crimsonBorder,
    shadowColor: COLORS.crimson,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.emerald,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassMedium,
    borderWidth: 2,
    borderColor: COLORS.glassBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.emerald,
    borderRadius: RADIUS.full,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  nameInput: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    padding: 0,
  },
  investedLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pnlBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  pnlBadgeWin: {
    backgroundColor: COLORS.emeraldGlow,
    borderColor: COLORS.emeraldBorder,
  },
  pnlBadgeLoss: {
    backgroundColor: COLORS.crimsonGlow,
    borderColor: COLORS.crimsonBorder,
  },
  pnlText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  pnlTextWin: {
    color: COLORS.emerald,
  },
  pnlTextLoss: {
    color: COLORS.crimsonLight,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.xs,
    marginVertical: 2,
  },
  amountRowGlow: {
    backgroundColor: COLORS.crimsonGlow,
    borderWidth: 1,
    borderColor: COLORS.crimsonBorder,
  },
  amountLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    width: 60,
    fontWeight: '600',
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassMedium,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.sm,
  },
  currencyPrefix: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginRight: 2,
  },
  currencySuffix: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZE.base, // mínimo 16px para evitar auto-zoom en iOS
    color: COLORS.textPrimary,
    fontWeight: '600',
    paddingVertical: SPACING.xs,
  },
  inputDisabled: {
    color: COLORS.textSecondary,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    minWidth: 32,
    justifyContent: 'center',
  },
  checkboxConfirmed: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  checkboxPending: {
    backgroundColor: COLORS.crimsonGlow,
    borderColor: COLORS.crimsonBorder,
  },
  checkboxTime: {
    fontSize: 9,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  removeBtn: {
    padding: SPACING.xs,
  },
  addRebuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  addRebuyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.emerald,
    fontWeight: '600',
  },
  finalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  finalLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
    fontWeight: '700',
    width: 100,
  },
  finalInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
    paddingHorizontal: SPACING.sm,
  },
  netResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  netResultWin: {
    backgroundColor: COLORS.emeraldGlow,
    borderColor: COLORS.emeraldBorder,
  },
  netResultLoss: {
    backgroundColor: COLORS.crimsonGlow,
    borderColor: COLORS.crimsonBorder,
  },
  netResultText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  netResultTextWin: {
    color: COLORS.emerald,
  },
  netResultTextLoss: {
    color: COLORS.crimsonLight,
  },
});
