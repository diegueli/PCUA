import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import DataIntegrityHeader from '../components/DataIntegrityHeader';
import SessionConfig from '../components/SessionConfig';
import PlayerCard from '../components/PlayerCard';
import TableBalanceWidget from '../components/TableBalanceWidget';
import FooterActions from '../components/WhatsAppButton';
import AddPlayerModal from '../components/AddPlayerModal';

export default function HomeScreen() {
  const { state } = useSession();
  const { players, sessionState } = state;
  const [modalVisible, setModalVisible] = useState(false);

  const isLocked = sessionState !== 'OPEN';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header fijo */}
      <DataIntegrityHeader />

      {/* Lista de jugadores */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Configuración global de la mesa */}
        <SessionConfig />

        {players.length === 0 ? (
          <EmptyState onAddPress={() => setModalVisible(true)} />
        ) : (
          players.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))
        )}

        {/* Botón añadir jugador */}
        {players.length > 0 && !isLocked && (
          <TouchableOpacity style={styles.addMoreBtn} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="account-plus-outline" size={18} color={COLORS.emerald} />
            <Text style={styles.addMoreText}>Agregar jugador</Text>
          </TouchableOpacity>
        )}

        {/* Widget de balance */}
        {players.length > 0 && <TableBalanceWidget />}

        <View style={styles.scrollPad} />
      </ScrollView>

      {/* Footer: reset + WhatsApp */}
      <FooterActions />

      {/* Modal agregar jugador */}
      <AddPlayerModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

function EmptyState({ onAddPress }) {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="cards-playing-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Mesa vacía</Text>
      <Text style={styles.emptySubtitle}>
        Agrega los jugadores para comenzar a registrar la sesión de poker.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAddPress}>
        <MaterialCommunityIcons name="account-plus" size={20} color={COLORS.textInverse} />
        <Text style={styles.emptyBtnText}>Agregar primer jugador</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    backgroundColor: COLORS.emeraldGlow,
  },
  addMoreText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.emerald,
    fontWeight: '700',
  },
  scrollPad: {
    height: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.emerald,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  emptyBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
});
