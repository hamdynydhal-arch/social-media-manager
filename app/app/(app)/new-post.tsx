import { useRouter } from 'expo-router';
import UnifiedPostForm from '../../src/components/UnifiedPostForm';

export default function NewPostScreen() {
  const router = useRouter();
  return (
    <UnifiedPostForm
      onSuccess={() => router.replace('/(app)/dashboard')}
    />
  );
}
