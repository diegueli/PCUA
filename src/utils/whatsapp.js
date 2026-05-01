import { Linking } from 'react-native';
import { formatCLP, formatCLPSigned } from './currency';

export function generateSummaryMessage(players, sessionDate) {
  const date = sessionDate || new Date().toLocaleDateString('es-CL');

  const totalPot = players.reduce((sum, p) => {
    const rebuysTotal = p.rebuys.reduce((s, r) => s + r.amount, 0);
    return sum + p.buyIn + rebuysTotal;
  }, 0);

  let msg = `🎰 *Resumen de Sesión — Poker Night* 🎰\n\n`;
  msg += `📅 Fecha: ${date}\n`;
  msg += `💰 Pot Total: ${formatCLP(totalPot)} CLP\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Ordenar: mayores ganancias primero
  const sorted = [...players].sort((a, b) => {
    const pnlA = a.finalChips - (a.buyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
    const pnlB = b.finalChips - (b.buyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
    return pnlB - pnlA;
  });

  // Encontrar el mayor ganador para indicar a quién pagar
  const winners = sorted.filter(p => {
    const invested = p.buyIn + p.rebuys.reduce((s, r) => s + r.amount, 0);
    return p.finalChips - invested > 0;
  });

  sorted.forEach(player => {
    const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
    const invested = player.buyIn + rebuysTotal;
    const pnl = player.finalChips - invested;
    const isWinner = pnl >= 0;

    msg += `👤 *${player.name}*\n`;
    msg += `  📥 Invirtió: ${formatCLP(invested)} CLP\n`;
    if (player.rebuys.length > 0) {
      msg += `     _(Buy-in: ${formatCLP(player.buyIn)} + Rebuys: ${formatCLP(rebuysTotal)})_\n`;
    }
    msg += `  📤 Retira: ${formatCLP(player.finalChips)} CLP\n`;
    msg += `  ${isWinner ? '✅' : '❌'} *Resultado: ${formatCLPSigned(pnl)} CLP*\n`;

    if (!isWinner && winners.length > 0) {
      msg += `  💸 _Paga a ${winners[0].name}_\n`;
    }
    msg += `\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🔄 *Mesa Cuadrada Correctamente* ✔️\n`;
  msg += `_Generado por Poker Admin App_`;

  return msg;
}

export async function openWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  const appUrl = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://wa.me/?text=${encoded}`;

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    await Linking.openURL(canOpen ? appUrl : webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}
