import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { generateId } from '../utils/id';

const STORAGE_KEY = 'pcua_session';

function makePlayer(name = '', photo = null) {
  return { id: generateId(), name, photo, buyInConfirmed: false, buyInConfirmedAt: null, rebuys: [], finalChips: 0 };
}

function makeRebuy() {
  return { id: generateId(), amount: 0, confirmed: false, confirmedAt: null };
}

const initialState = {
  sessionState: 'OPEN',
  sessionDate: new Date().toISOString(),
  globalBuyIn: 0,
  utilidad: 0,
  players: [],
};

function sessionReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE': return { ...initialState, ...action.payload };
    case 'RESET_SESSION': return { ...initialState, sessionDate: new Date().toISOString() };
    case 'SET_SESSION_STATE': return { ...state, sessionState: action.payload };
    case 'SET_GLOBAL_BUYIN': return { ...state, globalBuyIn: action.payload };
    case 'SET_UTILIDAD': return { ...state, utilidad: action.payload };
    case 'ADD_PLAYER': return { ...state, players: [...state.players, makePlayer(action.payload.name, action.payload.photo)] };
    case 'REMOVE_PLAYER': return { ...state, players: state.players.filter(p => p.id !== action.payload) };
    case 'UPDATE_PLAYER': {
      const { id, field, value } = action.payload;
      return { ...state, players: state.players.map(p => p.id === id ? { ...p, [field]: value } : p) };
    }
    case 'TOGGLE_BUYIN_CONFIRMED': {
      const now = new Date().toISOString();
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== action.payload) return p;
          return { ...p, buyInConfirmed: !p.buyInConfirmed, buyInConfirmedAt: p.buyInConfirmed ? null : now };
        }),
      };
    }
    case 'ADD_REBUY':
      return { ...state, players: state.players.map(p => p.id === action.payload ? { ...p, rebuys: [...p.rebuys, makeRebuy()] } : p) };
    case 'REMOVE_REBUY': {
      const { playerId, rebuyId } = action.payload;
      return { ...state, players: state.players.map(p => p.id === playerId ? { ...p, rebuys: p.rebuys.filter(r => r.id !== rebuyId) } : p) };
    }
    case 'UPDATE_REBUY': {
      const { playerId, rebuyId, amount } = action.payload;
      return { ...state, players: state.players.map(p => p.id === playerId ? { ...p, rebuys: p.rebuys.map(r => r.id === rebuyId ? { ...r, amount } : r) } : p) };
    }
    case 'TOGGLE_REBUY_CONFIRMED': {
      const { playerId, rebuyId } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== playerId) return p;
          return { ...p, rebuys: p.rebuys.map(r => r.id !== rebuyId ? r : { ...r, confirmed: !r.confirmed, confirmedAt: r.confirmed ? null : now }) };
        }),
      };
    }
    default: return state;
  }
}

export function computeSessionStats(state) {
  const { players, globalBuyIn = 0, utilidad = 0 } = state;
  let confirmedPot = 0, unconfirmedDebt = 0, totalFinalChips = 0;

  players.forEach(p => {
    if (globalBuyIn > 0) {
      if (p.buyInConfirmed) confirmedPot += globalBuyIn;
      else unconfirmedDebt += globalBuyIn;
    }
    p.rebuys.forEach(r => {
      if (r.confirmed) confirmedPot += r.amount;
      else if (r.amount > 0) unconfirmedDebt += r.amount;
    });
    totalFinalChips += p.finalChips;
  });

  const totalRebuys = players.reduce((sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0), 0);
  const totalInvested = globalBuyIn * players.length + totalRebuys;
  const discrepancy = totalInvested - totalFinalChips;
  const isBalanced = players.length > 0 && discrepancy === 0;
  const depositoCaja = Math.max(0, totalInvested - utilidad);

  return { confirmedPot, unconfirmedDebt, totalInvested, totalFinalChips, discrepancy, isBalanced, depositoCaja };
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'LOAD_STATE', payload: JSON.parse(raw) });
    } catch {}
  }, []);

  const resetSession = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  return <SessionContext.Provider value={{ state, dispatch, resetSession }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}
