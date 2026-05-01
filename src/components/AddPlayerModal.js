import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useSession } from '../context/SessionContext';

export default function AddPlayerModal({ visible, onClose }) {
  const { dispatch } = useSession();
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch({ type: 'ADD_PLAYER', payload: { name: name.trim(), photo: null } });
    setName('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvContainer}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Título */}
          <View style={styles.headerRow}>
            <MaterialCommunityIcons name="account-plus" size={22} color={COLORS.emerald} />
            <Text style={styles.title}>Agregar Jugador</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Input de nombre */}
          <Text style={styles.label}>Nombre del jugador</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Alex, Juan, María..."
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={30}
          />

          {/* Botón agregar */}
          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
            disabled={!name.trim()}
          >
            <MaterialCommunityIcons name="account-plus" size={18} color={name.trim() ? COLORS.textInverse : COLORS.textMuted} />
            <Text style={[styles.addBtnText, !name.trim() && styles.addBtnTextDisabled]}>
              Agregar a la mesa
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            💡 Podrás agregar la foto del jugador tocando el avatar en la tarjeta.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  kvContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.glassBorderStrong,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorderStrong,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.emerald,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  addBtnDisabled: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  addBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  addBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingBottom: SPACING.sm,
  },
});
