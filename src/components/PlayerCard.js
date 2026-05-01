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
// Avatar circular
// ---------------------------------------------------------------------------
function Avatar({ name, photo, onPress }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <TouchableOpacity onPress={onPress} style={s.avatarContainer}>
      {photo ? (
        <Image source={{ uri: photo }} style={s.avatarImage} />
      ) : (
        <View style={s.avatarPlaceholder}>
          <Text style={s.avatarInitials}>{initials}</Text>
        </View>
      )}
      <View style={s.avatarEditBadge}>
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
      style={[s.checkbox, confirmed ? s.checkboxConfirmed : s.checkboxPending]}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {confirmed ? (
        <MaterialCommunityIcons name="check" size={14} color={COLORS.textInverse} />
      ) : (
        <MaterialCommunityIcons name="cash" size={12} color={COLORS.crimsonLight} />
      )}
      {timeLabel ? <Text style={s.checkboxTime}>{timeLabel}</Text> : null}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Fila de rebuy
// ---------------------------------------------------------------------------
function RebuyRow({ rebuy, index, playerId, disabled }) {
  const { dispatch } = useSession();
  const [raw, setRaw] = useState(rebuy.amount > 0 ? rebuy.amount.toString() : '');

  const handleChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setRaw(clean);
    dispatch({ type: 'UPDATE_REBUY', payload: { playerId, rebuyId: rebuy.id, amount: parseInt(clean) || 0 } });
  };

  const hasValue = rebuy.amount > 0;
  const glowing = hasValue && !rebuy.confirmed;

  return (
    <View style={[s.amountRow, glowing && s.amountRowGlow]}>
      <Text style={s.amountLabel}>Rebuy {index + 1}</Text>
      <View style={s.amountInputWrapper}>
        <Text style={s.prefix}>$</Text>
        <TextInput
          style={[s.amountInput, disabled && s.inputDisabled]}
          value={raw}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          editable={!disabled}
          maxLength={9}
          allowFontScaling={false}
        />
        <Text style={s.suffix}>CLP</Text>
      </View>
      <ConfirmCheckbox
        confirmed={rebuy.confirmed}
        confirmedAt={rebuy.confirmedAt}
        onToggle={() => dispatch({ type: 'TOGGLE_REBUY_CONFIRMED', payload: { playerId, rebuyId: rebuy.id } })}
        disabled={disabled}
      />
      {!disabled && (
        <TouchableOpacity
          onPress={() => dispatch({ type: 'REMOVE_REBUY', payload: { playerId, rebuyId: rebuy.id } })}
          style={s.removeBtn}
        >
          <Ionicons name="close" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de jugador
// ---------------------------------------------------------------------------
export default function PlayerCard({ player }) {
  const { dispatch, state } = useSession();
  const { globalBuyIn, sessionState } = state;
  const isLocked = sessionState !== 'OPEN';

  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const totalInvested = globalBuyIn + rebuysTotal;
  const pnl = player.finalChips - totalInvested;
  const hasFinalChips = player.finalChips > 0;
  const hasBuyIn = globalBuyIn > 0;

  const hasUnconfirmed =
    (hasBuyIn && !player.buyInConfirmed) ||
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
      `Eliminar a ${player.name || 'este jugador'} de la mesa?`,
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
    <View style={[s.card, hasUnconfirmed && s.cardWarning]}>

      {/* Cabecera */}
      <View style={s.cardHeader}>
        <Avatar name={player.name} photo={player.photo} onPress={handlePickPhoto} />
        <View style={s.nameBlock}>
          <TextInput
            style={s.nameInput}
            value={player.name}
            onChangeText={text => dispatch({ type: 'UPDATE_PLAYER', payload: { id: player.id, field: 'name', value: text } })}
            placeholder="Nombre del jugador"
            placeholderTextColor={COLORS.textMuted}
            editable={!isLocked}
            allowFontScaling={false}
          />
          {totalInvested > 0 && (
            <Text style={s.investedLabel}>Invirtió {formatCLP(totalInvested)} CLP</Text>
          )}
        </View>
        {hasFinalChips && totalInvested > 0 && (
          <View style={[s.pnlBadge, pnl >= 0 ? s.pnlBadgeWin : s.pnlBadgeLoss]}>
            <Text style={[s.pnlText, pnl >= 0 ? s.pnlTextWin : s.pnlTextLoss]}>
              {formatCLPSigned(pnl)}
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={handleRemovePlayer} style={s.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      {/* Buy-in global (solo confirmación) */}
      <View style={[s.amountRow, hasBuyIn && !player.buyInConfirmed && s.amountRowGlow]}>
        <Text style={s.amountLabel}>Buy-in</Text>
        <View style={[s.amountInputWrapper, s.amountReadOnly]}>
          <MaterialCommunityIcons name="cash-multiple" size={14} color={COLORS.emerald} />
          <Text style={s.readOnlyAmount}>
            {hasBuyIn ? formatCLP(globalBuyIn) : '—'}
          </Text>
          <Text style={s.suffix}>CLP</Text>
        </View>
        <ConfirmCheckbox
          confirmed={player.buyInConfirmed}
          confirmedAt={player.buyInConfirmedAt}
          onToggle={() => dispatch({ type: 'TOGGLE_BUYIN_CONFIRMED', payload: player.id })}
          disabled={!hasBuyIn || isLocked}
        />
      </View>

      {/* Rebuys */}
      {player.rebuys.map((rebuy, idx) => (
        <RebuyRow key={rebuy.id} rebuy={rebuy} index={idx} playerId={player.id} disabled={isLocked} />
      ))}

      {!isLocked && (
        <TouchableOpacity
          style={s.addRebuyBtn}
          onPress={() => dispatch({ type: 'ADD_REBUY', payload: player.id })}
        >
          <Ionicons name="add-circle-outline" size={15} color={COLORS.emerald} />
          <Text style={s.addRebuyText}>Agregar Rebuy</Text>
        </TouchableOpacity>
      )}

      <View style={s.divider} />

      {/* Fichas finales */}
      <View style={s.finalRow}>
        <MaterialCommunityIcons name="poker-chip" size={18} color={COLORS.warning} />
        <Text style={s.finalLabel}>Fichas Finales</Text>
        <View style={s.finalInputWrapper}>
          <Text style={s.prefix}>$</Text>
          <TextInput
            style={s.amountInput}
            value={finalRaw}
            onChangeText={handleFinalChipsChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            maxLength={9}
            allowFontScaling={false}
          />
          <Text style={s.suffix}>CLP</Text>
        </View>
      </View>

      {/* Resultado neto */}
      {hasFinalChips && totalInvested > 0 && (
        <View style={[s.netResult, pnl >= 0 ? s.netResultWin : s.netResultLoss]}>
          <MaterialCommunityIcons
            name={pnl >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={pnl >= 0 ? COLORS.emerald : COLORS.crimsonLight}
          />
          <Text style={[s.netResultText, pnl >= 0 ? s.netResultTextWin : s.netResultTextLoss]}>
            Resultado: {formatCLPSigned(pnl)} CLP
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
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
  avatarContainer: { position: 'relative' },
  avatarImage: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    borderWidth: 2, borderColor: COLORS.emerald,
  },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassMedium,
    borderWidth: 2, borderColor: COLORS.glassBorderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: FONT_SIZE.base, fontWeight: '800',
    color: COLORS.emerald, letterSpacing: 1,
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.emerald, borderRadius: RADIUS.full,
    width: 14, height: 14, alignItems: 'center', justifyContent: 'center',
  },
  nameBlock: { flex: 1 },
  nameInput: {
    fontSize: FONT_SIZE.base, fontWeight: '700',
    color: COLORS.textPrimary, padding: 0,
  },
  investedLabel: {
    fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2,
  },
  pnlBadge: {
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm,
    paddingVertical: 3, borderWidth: 1,
  },
  pnlBadgeWin: { backgroundColor: COLORS.emeraldGlow, borderColor: COLORS.emeraldBorder },
  pnlBadgeLoss: { backgroundColor: COLORS.crimsonGlow, borderColor: COLORS.crimsonBorder },
  pnlText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  pnlTextWin: { color: COLORS.emerald },
  pnlTextLoss: { color: COLORS.crimsonLight },
  deleteBtn: { padding: SPACING.xs },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: SPACING.md },

  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.sm, borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.xs, marginVertical: 2,
  },
  amountRowGlow: {
    backgroundColor: COLORS.crimsonGlow,
    borderWidth: 1, borderColor: COLORS.crimsonBorder,
  },
  amountLabel: {
    fontSize: FONT_SIZE.sm, color: COLORS.textSecondary,
    width: 60, fontWeight: '600',
  },
  amountInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.glassMedium, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.sm,
  },
  amountReadOnly: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.emeraldBorder,
    gap: SPACING.xs,
  },
  readOnlyAmount: {
    flex: 1, fontSize: FONT_SIZE.base, fontWeight: '700',
    color: COLORS.emerald, paddingVertical: SPACING.xs,
  },
  prefix: {
    fontSize: FONT_SIZE.base, color: COLORS.textSecondary,
    fontWeight: '700', marginRight: 2,
  },
  suffix: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginLeft: 4 },
  amountInput: {
    flex: 1, fontSize: FONT_SIZE.base, color: COLORS.textPrimary,
    fontWeight: '600', paddingVertical: SPACING.xs,
  },
  inputDisabled: { color: COLORS.textSecondary },
  checkbox: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 6,
    borderWidth: 1, minWidth: 32, justifyContent: 'center',
  },
  checkboxConfirmed: { backgroundColor: COLORS.emerald, borderColor: COLORS.emerald },
  checkboxPending: { backgroundColor: COLORS.crimsonGlow, borderColor: COLORS.crimsonBorder },
  checkboxTime: { fontSize: 9, color: COLORS.textInverse, fontWeight: '700' },
  removeBtn: { padding: SPACING.xs },
  addRebuyBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.xs, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
  },
  addRebuyText: { fontSize: FONT_SIZE.sm, color: COLORS.emerald, fontWeight: '600' },
  finalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm,
  },
  finalLabel: {
    fontSize: FONT_SIZE.sm, color: COLORS.warning,
    fontWeight: '700', width: 100,
  },
  finalInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.glassStrong, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.glassBorderStrong,
    paddingHorizontal: SPACING.sm,
  },
  netResult: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    margin: SPACING.md, marginTop: SPACING.sm,
    padding: SPACING.sm, borderRadius: RADIUS.md,
    borderWidth: 1, justifyContent: 'center',
  },
  netResultWin: { backgroundColor: COLORS.emeraldGlow, borderColor: COLORS.emeraldBorder },
  netResultLoss: { backgroundColor: COLORS.crimsonGlow, borderColor: COLORS.crimsonBorder },
  netResultText: { fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: 0.3 },
  netResultTextWin: { color: COLORS.emerald },
  netResultTextLoss: { color: COLORS.crimsonLight },
});
