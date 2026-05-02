import React, { useRef, useState } from 'react';
import { X, ImagePlus, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import Infographic from './Infographic.jsx';

export default function InfographicModal({ visible, onClose, players, sessionDate, globalBuyIn }) {
  const infRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleDownload = async () => {
    if (!infRef.current) return;
    setSaving(true);
    setSaved(false);
    try {
      const canvas = await html2canvas(infRef.current, { scale: 2, backgroundColor: '#0A0A0A', useCORS: true, logging: false });
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `poker-resumen-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      setTimeout(onClose, 1500);
    } catch {
      alert('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={22} color="var(--text-secondary)" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#F2F2F2', letterSpacing: 0.5 }}>Resumen de Partida</span>
        <div style={{ width: 38 }} />
      </div>

      {/* Scrollable preview */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 16, paddingLeft: 24, paddingRight: 24, lineHeight: 1.6 }}>
          Presiona "Descargar imagen" y luego compártela por WhatsApp desde tu galería
        </p>
        <div style={{ boxShadow: '0 0 40px rgba(0,200,81,0.15)', borderRadius: 18 }}>
          <Infographic ref={infRef} players={players} sessionDate={sessionDate} globalBuyIn={globalBuyIn} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 24px', borderTop: '1px solid var(--glass-border)', backgroundColor: '#0A0A0A' }}>
        <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 18, border: '1px solid var(--glass-border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)', fontWeight: 700 }}>
          Cerrar
        </button>
        <button
          onClick={handleDownload}
          disabled={saving}
          style={{
            flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 0', borderRadius: 18, border: 'none', cursor: saving ? 'default' : 'pointer',
            backgroundColor: saved ? '#009940' : '#00C851',
            fontSize: 16, fontWeight: 800, color: '#0A0A0A',
            boxShadow: '0 4px 20px rgba(0,200,81,0.35)',
          }}
        >
          {saved ? <Check size={20} color="#0A0A0A" /> : <ImagePlus size={20} color="#0A0A0A" />}
          {saving ? 'Generando…' : saved ? 'Listo' : 'Descargar imagen'}
        </button>
      </div>
    </div>
  );
}
