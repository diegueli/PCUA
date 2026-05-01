import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import Infographic from './Infographic';

export default function InfographicModal({ visible, onClose, players, sessionDate }) {
  const infographicRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const handleShare = async () => {
    if (!infographicRef.current) return;
    setCapturing(true);
    try {
      const uri = await captureRef(infographicRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('No disponible', 'La función de compartir no está disponible en este dispositivo.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartir resumen de partida',
        UTI: 'public.png',
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>

        {/* Barra superior del modal */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={s.topTitle}>Vista Previa</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Preview de la infografía */}
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={s.hint}>Toca "Compartir" para enviar esta imagen por WhatsApp</Text>

          {/* La infografía — el ref va aquí para capturarla */}
          <View style={s.infographicWrapper}>
            <Infographic
              ref={infographicRef}
              players={players}
              sessionDate={sessionDate}
            />
          </View>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>

        {/* Botones de acción fijos abajo */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.shareBtn, capturing && s.shareBtnLoading]}
            onPress={handleShare}
            disabled={capturing}
          >
            {capturing ? (
              <ActivityIndicator size="small" color={COLORS.textInverse} />
            ) : (
              <FontAwesome5 name="whatsapp" size={18} color={COLORS.textInverse} />
            )}
            <Text style={s.shareText}>
              {capturing ? 'Generando…' : 'Compartir imagen'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  closeBtn: {
    padding: SPACING.xs,
    width: 38,
    alignItems: 'center',
  },
  topTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.base,
    alignItems: 'center',
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.base,
    paddingHorizontal: SPACING.xl,
    lineHeight: 18,
  },
  infographicWrapper: {
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.base,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    backgroundColor: COLORS.background,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cancelText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  shareBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.whatsapp,
    shadowColor: COLORS.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  shareBtnLoading: {
    backgroundColor: COLORS.whatsappDark,
  },
  shareText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
});
