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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import Infographic from './Infographic';

export default function InfographicModal({ visible, onClose, players, sessionDate }) {
  const infographicRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveToGallery = async () => {
    if (!infographicRef.current) return;
    setSaving(true);
    setSaved(false);

    try {
      // Capturar la infografía como imagen PNG
      const uri = await captureRef(infographicRef, {
        format: 'png',
        quality: 1,
        result: Platform.OS === 'web' ? 'base64' : 'tmpfile',
      });

      if (Platform.OS === 'web') {
        // En web: descarga directa desde el navegador
        const link = document.createElement('a');
        link.download = `poker-resumen-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.png`;
        link.href = `data:image/png;base64,${uri}`;
        link.click();
        setSaved(true);
        Alert.alert(
          'Imagen descargada',
          'El resumen se descargo como imagen PNG. Puedes compartirla por WhatsApp desde tu carpeta de descargas.',
          [{ text: 'Perfecto', onPress: onClose }]
        );
      } else {
        // En móvil: guardar en galería
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso denegado',
            'Necesitamos acceso a tu galeria de fotos. Habilitalo en Ajustes > Poker Admin.',
            [{ text: 'OK' }]
          );
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        setSaved(true);
        Alert.alert(
          'Imagen guardada',
          'El resumen se guardo en tu galeria de fotos. Puedes compartirla desde ahi por WhatsApp.',
          [{ text: 'Perfecto', onPress: onClose }]
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo guardar la imagen. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>

        {/* Barra superior */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={s.topTitle}>Resumen de Partida</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Preview de la infografía */}
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={s.hint}>
            Presiona "Guardar en Fotos" y luego comparte desde tu galería por WhatsApp
          </Text>

          <View style={s.infographicWrapper}>
            <Infographic
              ref={infographicRef}
              players={players}
              sessionDate={sessionDate}
            />
          </View>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>

        {/* Botones fijos abajo */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Cerrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.saveBtn, saving && s.saveBtnLoading, saved && s.saveBtnDone]}
            onPress={handleSaveToGallery}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.textInverse} />
            ) : (
              <MaterialCommunityIcons
                name={saved ? 'check' : 'image-plus'}
                size={20}
                color={COLORS.textInverse}
              />
            )}
            <Text style={s.saveText}>
              {saving
                ? 'Guardando…'
                : saved
                ? 'Listo'
                : Platform.OS === 'web' ? 'Descargar imagen' : 'Guardar en Fotos'}
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
    lineHeight: 20,
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
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.emerald,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnLoading: {
    backgroundColor: COLORS.emeraldDark,
    shadowOpacity: 0,
  },
  saveBtnDone: {
    backgroundColor: COLORS.emeraldDark,
  },
  saveText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
});
