import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { useColors } from '@/hooks/use-colors';
import { useShadow, Brand, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/store/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const colors = useColors();
  const shadow = useShadow();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (e) {
      Alert.alert('Login failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.hero, { backgroundColor: Brand.main }]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.brand}>Maliquez Connect</Text>
          <Text style={styles.sub}>Provider Portal</Text>
        </View>

        <View
          style={[
            styles.form,
            { backgroundColor: colors.surface, borderColor: colors.border },
            shadow,
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            Sign in to manage your listings and reviews.
          </Text>
          <View style={{ height: Spacing.three }} />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="you@example.com"
            autoCapitalize="none"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <View style={{ height: Spacing.three }} />
          <Button title="Sign In" onPress={submit} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  brand: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  form: {
    marginTop: -32,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: '800' },
  caption: { fontSize: 14, marginTop: 4 },
});
