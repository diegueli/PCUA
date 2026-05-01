import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useSession, computeSessionStats } from '../context/SessionContext';
import { generateSummaryMessage, openWhatsApp } from '../utils/whatsapp';

export default function WhatsAppButton() {
  const { state } = useSession();
  const { players, sessionDate } = state;
  const { isBalanced } = computeSessionStats(players);
  const [sending, setSending] = useState(false);

  const hasPlayers = players.length > 0;
  const canSend = isBalanced && hasPlayers;

  const handlePress = async () => {
    if (!canSend) {
      Alert.alert(
        'Mesa sin cuadrar',
        !hasPlayers
          ? 'Agrega jugadores antes de enviar el resumen.'
          : 'La suma de fichas finales debe ser igual al pot total antes de enviar el resumen.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    setSending(true);
    try {
      const message = generateSummaryMessage(players, new Date(sessionDate).toLocaleDateString('es-CL'));
      await openWhatsApp(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.button, canSend ? styles.buttonActive : styles.buttonDisabled]}
      >
        <View style={styles.iconWrapper}>
          <FontAwesome5 name="whatsapp" size={24} color={canSend ? COLORS.textInverse : COLORS.textMuted} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.buttonLabel, canSend ? styles.labelActive : styles.labelDisabled]}>
            {sending ? 'Abriendo WhatsApp…' : 'Enviar Resumen por WhatsApp'}
          </Text>
          <Text style={[styles.buttonSub, canSend ? styles.subActive : styles.subDisabled]}>
            {canSend
              ? `${players.length} jugador${players.length !== 1 ? 'es' : ''} • Mesa cuadrada ✓`
              : isBalanced
              ? 'Agrega jugadores para continuar'
              : 'Cuadra la mesa antes de enviar'}
          </Text>
        </View>

        <MaterialCommunityIcons
          name={canSend ? 'send' : 'lock'}
          size={20}
          color={canSend ? COLORS.textInverse : COLORS.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  buttonActive: {
    backgroundColor: COLORS.whatsapp,
    shadowColor: COLORS.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: COLORS.textInverse,
  },
  labelDisabled: {
    color: COLORS.textMuted,
  },
  buttonSub: {
    fontSize: FONT_SIZE.xs,
    marginTop: 1,
    fontWeight: '500',
  },
  subActive: {
    color: 'rgba(0,0,0,0.55)',
  },
  subDisabled: {
    color: COLORS.textMuted,
  },
});
