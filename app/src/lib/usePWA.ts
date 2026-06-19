import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getPWAState, subscribePWA, PWAState } from './pwa';

export function usePWA(): PWAState {
  const isWeb = Platform.OS === 'web';
  const [state, setState] = useState<PWAState>(isWeb ? getPWAState() : { type: 'unsupported' });

  useEffect(() => {
    if (!isWeb) return;
    setState(getPWAState());
    return subscribePWA(() => setState(getPWAState()));
  }, [isWeb]);

  return state;
}
