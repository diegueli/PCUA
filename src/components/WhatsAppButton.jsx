import React, { useState } from 'react';
import { RefreshCw, MessageCircle, ImagePlus, Lock } from 'lucide-react';
import { useSession, computeSessionStats } from '../context/SessionContext.jsx';
import InfographicModal from './InfographicModal.jsx';

export default function FooterActions() {
  const { state, resetSession } = useSession();
  const { players, sessionDate, globalBuyIn } = state;
  const { isBalanced } = computeSessionStats(state);
  const [modalVisible, setModalVisible] = useState(false);

  const hasPlayers = players.length > 0;
  const canShare = isBalanced && hasPlayers;

  const handleReset = () => {
    document.activeElement?.blur();
    setTimeout(() => {
      if (window.confirm('Se borrarán todos los jugadores y datos. Esta acción no se puede deshacer.')) {
        resetSession();
      }
    }, 50);
  };

  const handleWhatsApp = () => {
    if (!canShare) {
      alert(!hasPlayers ? 'Agrega jugadores antes de generar el resumen.' : 'La suma de fichas finales debe ser igual al pot total para generar el resumen.');
      return;
    }
    setModalVisible(true);
  };

  return (
    <>
      <div style={{ padding: '8px 16px 24px', backgroundColor: '#0A0A0A', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Reset */}
        <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 18, border: '1px solid var(--crimson-border)', backgroundColor: 'var(--crimson-glow)', cursor: 'pointer', color: '#FF3B1F', fontSize: 14, fontWeight: 700 }}>
          <RefreshCw size={18} color="#FF3B1F" />
          Resetear Mesa
        </button>

        {/* WhatsApp / Share */}
        <button
          onClick={handleWhatsApp}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 24, border: canShare ? 'none' : '1px solid var(--glass-border)', cursor: 'pointer',
            backgroundColor: canShare ? '#25D366' : 'var(--glass)',
            boxShadow: canShare ? '0 4px 20px rgba(37,211,102,0.35)' : 'none',
          }}
        >
          <MessageCircle size={20} color={canShare ? '#0A0A0A' : 'var(--text-muted)'} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: canShare ? '#0A0A0A' : 'var(--text-muted)', margin: 0 }}>Enviar Resumen</p>
            <p style={{ fontSize: 10, color: canShare ? 'rgba(0,0,0,0.5)' : 'var(--text-muted)', margin: '1px 0 0', fontWeight: 500 }}>
              {canShare ? 'Genera infografía → WhatsApp' : isBalanced ? 'Agrega jugadores' : 'Cuadra la mesa primero'}
            </p>
          </div>
          {canShare ? <ImagePlus size={18} color="#0A0A0A" /> : <Lock size={18} color="var(--text-muted)" />}
        </button>
      </div>

      <InfographicModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        players={players}
        sessionDate={sessionDate}
        globalBuyIn={globalBuyIn}
      />
    </>
  );
}
