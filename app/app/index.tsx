import { Redirect } from 'expo-router';
import { PREVIEW_MODE } from './_layout';

export default function Index() {
  return <Redirect href={PREVIEW_MODE ? '/(app)/dashboard' : '/(auth)/login'} />;
}
