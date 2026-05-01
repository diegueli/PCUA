import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/id';

const STORAGE_KEY = '@pcua_session';

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

function makePlayer(name = '', photo = null) {
  return {
    id: generateId(),
    name,
    photo,
    buyIn: 0,
    buyInConfirmed: false,
    buyInConfirmedAt: null,
    rebuys: [],
    finalChips: 0,
  };
}

function makeRebuy(amount = 0) {
  return {
    id: generateId(),
    amount,
    confirmed: false,
    confirmedAt: null,
  };
}

const initialState = {
  sessionState: 'OPEN',
  sessionDate: new Date().toISOString(),
  players: [],
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function sessionReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...initialState, ...action.payload };

    case 'RESET_SESSION':
      return { ...initialState, sessionDate: new Date().toISOString() };

    case 'SET_SESSION_STATE':
      return { ...state, sessionState: action.payload };

    // --- Jugadores ---
    case 'ADD_PLAYER': {
      const player = makePlayer(action.payload.name, action.payload.photo);
      return { ...state, players: [...state.players, player] };
    }

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
      };

    case 'UPDATE_PLAYER': {
      const { id, field, value } = action.payload;
      return {
        ...state,
        players: state.players.map(p =>
          p.id === id ? { ...p, [field]: value } : p
        ),
      };
    }

    // --- Confirmación buy-in ---
    case 'TOGGLE_BUYIN_CONFIRMED': {
      const now = new Date().toISOString();
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== action.payload) return p;
          const wasConfirmed = p.buyInConfirmed;
          return {
            ...p,
            buyInConfirmed: !wasConfirmed,
            buyInConfirmedAt: wasConfirmed ? null : now,
          };
        }),
      };
    }

    // --- Rebuys ---
    case 'ADD_REBUY':
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== action.payload) return p;
          return { ...p, rebuys: [...p.rebuys, makeRebuy()] };
        }),
      };

    case 'REMOVE_REBUY': {
      const { playerId, rebuyId } = action.payload;
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== playerId) return p;
          return { ...p, rebuys: p.rebuys.filter(r => r.id !== rebuyId) };
        }),
      };
    }

    case 'UPDATE_REBUY': {
      const { playerId, rebuyId, amount } = action.payload;
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            rebuys: p.rebuys.map(r =>
              r.id === rebuyId ? { ...r, amount } : r
            ),
          };
        }),
      };
    }

    case 'TOGGLE_REBUY_CONFIRMED': {
      const { playerId, rebuyId } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            rebuys: p.rebuys.map(r => {
              if (r.id !== rebuyId) return r;
              const wasConfirmed = r.confirmed;
              return {
                ...r,
                confirmed: !wasConfirmed,
                confirmedAt: wasConfirmed ? null : now,
              };
            }),
          };
        }),
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Cálculos derivados
// ---------------------------------------------------------------------------

export function computeSessionStats(players) {
  let confirmedPot = 0;
  let unconfirmedDebt = 0;
  let totalInvested = 0;
  let totalFinalChips = 0;

  players.forEach(p => {
    const rebuysTotal = p.rebuys.reduce((s, r) => s + r.amount, 0);
    const invested = p.buyIn + rebuysTotal;
    totalInvested += invested;
    totalFinalChips += p.finalChips;

    if (p.buyInConfirmed) {
      confirmedPot += p.buyIn;
    } else {
      unconfirmedDebt += p.buyIn;
    }

    p.rebuys.forEach(r => {
      if (r.confirmed) {
        confirmedPot += r.amount;
      } else {
        unconfirmedDebt += r.amount;
      }
    });
  });

  const discrepancy = totalInvested - totalFinalChips;
  const isBalanced = players.length > 0 && discrepancy === 0;

  return { confirmedPot, unconfirmedDebt, totalInvested, totalFinalChips, discrepancy, isBalanced };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Persistir en AsyncStorage cuando cambia el estado
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  // Cargar desde AsyncStorage al iniciar
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) {
          const saved = JSON.parse(raw);
          dispatch({ type: 'LOAD_STATE', payload: saved });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
