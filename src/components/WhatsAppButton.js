import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useSession, computeSessionStats } from '../context/SessionContext';
import InfographicModal from './InfographicModal';

export default function FooterActions() {
  const { state, dispatch } = useSession();
  const { players, sessionDate } = state;
  const { isBalanced } = computeSessionStats(players);
  const [modalVisible, setModalVisible] = useState(false);

  const hasPlayers = players.length > 0;
  const canShare = isBalanced && hasPlayers;

  const handleWhatsApp = () => {
    if (!canShare) {
      Alert.alert(
        'No disponible',
        !hasPlayers
          ? 'Agrega jugadores antes de generar el resumen.'
          : 'La suma de fichas finales debe ser igual al pot total para generar el resumen.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setModalVisible(true);
  };

  const handleReset = () => {
    Alert.alert(
      '🗑️  Resetear Mesa',
      '¿Seguro que quieres borrar todos los datos y empezar una sesión nueva? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => dispatch({ type: 'RESET_SESSION' }),
        },
      ]
    );
  };

  return (
    <>
      <View style={s.container}>

        {/* Botón Resetear Mesa */}
        <TouchableOpacity style={s.resetBtn} onPress={handleReset} activeOpacity={0.75}>
          <MaterialCommunityIcons name="refresh" size={18} color={COLORS.crimsonLight} />
          <Text style={s.resetText}>Resetear Mesa</Text>
        </TouchableOpacity>

        {/* Botón WhatsApp */}
        <TouchableOpacity
          style={[s.whatsappBtn, !canShare && s.whatsappBtnDisabled]}
          onPress={handleWhatsApp}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="whatsapp" size={20} color={canShare ? COLORS.textInverse : COLORS.textMuted} />
          <View style={s.whatsappTextBlock}>
            <Text style={[s.whatsappLabel, !canShare && s.whatsappLabelDisabled]}>
              Enviar Resumen
            </Text>
            <Text style={[s.whatsappSub, !canShare && s.whatsappSubDisabled]}>
              {canShare
                ? 'Genera infografía → WhatsApp'
                : isBalanced ? 'Agrega jugadores' : 'Cuadra la mesa primero'}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={canShare ? 'image-plus' : 'lock-outline'}
            size={18}
            color={canShare ? COLORS.textInverse : COLORS.textMuted}
          />
        </TouchableOpacity>

      </View>

      {/* Modal con vista previa de la infografía */}
      <InfographicModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        players={players}
        sessionDate={sessionDate}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    gap: SPACING.sm,
  },

  // Botón reset
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.crimsonBorder,
    backgroundColor: COLORS.crimsonGlow,
  },
  resetText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.crimsonLight,
    letterSpacing: 0.3,
  },

  // Botón WhatsApp
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.whatsapp,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    shadowColor: COLORS.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  whatsappBtnDisabled: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  whatsappTextBlock: {
    flex: 1,
  },
  whatsappLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  whatsappLabelDisabled: {
    color: COLORS.textMuted,
  },
  whatsappSub: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(0,0,0,0.50)',
    marginTop: 1,
    fontWeight: '500',
  },
  whatsappSubDisabled: {
    color: COLORS.textMuted,
  },
});
