import React from 'react';
import { SessionProvider } from './src/context/SessionContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SessionProvider>
      <HomeScreen />
    </SessionProvider>
  );
}
