import React, { useState } from 'react';
import { SessionProvider } from './context/SessionContext.jsx';
import { useSession } from './context/SessionContext.jsx';
import DataIntegrityHeader from './components/DataIntegrityHeader.jsx';
import SessionConfig from './components/SessionConfig.jsx';
import PlayerCard from './components/PlayerCard.jsx';
import TableBalanceWidget from './components/TableBalanceWidget.jsx';
import FooterActions from './components/WhatsAppButton.jsx';
import AddPlayerModal from './components/AddPlayerModal.jsx';
import { UserPlus, PlaySquare } from 'lucide-react';

function HomeScreen() {
  const { state } = useSession();
  const { players, sessionState } = state;
  const [modalVisible, setModalVisible] = useState(false);
  const isLocked = sessionState !== 'OPEN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', backgroundColor: '#0A0A0A' }}>
      <DataIntegrityHeader />

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <SessionConfig />

        {players.length === 0 ? (
          <EmptyState onAddPress={() => setModalVisible(true)} />
        ) : (
          players.map(player => <PlayerCard key={player.id} player={player} />)
        )}

        {players.length > 0 && !isLocked && (
          <button
            onClick={() => setModalVisible(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, margin: '0 16px 12px', padding: '12px 0',
              border: '1px dashed rgba(0,200,81,0.35)', borderRadius: 18,
              backgroundColor: 'rgba(0,200,81,0.08)', cursor: 'pointer',
              color: '#00C851', fontSize: 14, fontWeight: 700, width: 'calc(100% - 32px)',
            }}
          >
            <UserPlus size={18} />
            Agregar jugador
          </button>
        )}

        {players.length > 0 && <TableBalanceWidget />}
        <div style={{ height: 20 }} />
      </div>

      <FooterActions onAddPlayer={() => setModalVisible(true)} />
      <AddPlayerModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
}

function EmptyState({ onAddPress }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 64, paddingLeft: 24, paddingRight: 24, gap: 16 }}>
      <PlaySquare size={64} color="var(--text-muted)" />
      <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 0.5 }}>Mesa vacía</p>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
        Agrega los jugadores para comenzar a registrar la sesión de poker.
      </p>
      <button
        onClick={onAddPress}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: '#00C851', borderRadius: 18, border: 'none',
          padding: '12px 24px', marginTop: 16, cursor: 'pointer',
          color: '#0A0A0A', fontSize: 16, fontWeight: 800,
        }}
      >
        <UserPlus size={20} color="#0A0A0A" />
        Agregar primer jugador
      </button>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <HomeScreen />
    </SessionProvider>
  );
}
