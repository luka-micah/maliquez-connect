import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { changePassword, updateProfile } from '@/api/profile';
import { Screen } from '@/components/ui/screen';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/store/auth';

export default function ProfileScreen() {
  const colors = useColors();
  const { user, setUser, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [businessName, setBusinessName] = useState(user?.providerProfile?.businessName ?? '');
  const [businessType, setBusinessType] = useState(user?.providerProfile?.businessType ?? '');
  const [website, setWebsite] = useState(user?.providerProfile?.website ?? '');
  const [description, setDescription] = useState(user?.providerProfile?.description ?? '');
  const [address, setAddress] = useState(user?.providerProfile?.address ?? '');
  const [stateValue, setStateValue] = useState(user?.providerProfile?.state ?? '');
  const [city, setCity] = useState(user?.providerProfile?.city ?? '');

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  if (!user) {
    return (
      <Screen>
        <Spinner label="Loading profile..." />
      </Screen>
    );
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await updateProfile({
        firstName,
        lastName,
        phone: phone || null,
        providerProfile: {
          businessName,
          businessType,
          website,
          description,
          address,
          state: stateValue,
          city,
        },
      });
      setUser(updated);
      setEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function submitPassword() {
    setPwError(null);
    if (newPassword.length < 6) return setPwError('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match');
    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      Alert.alert('Success', 'Your password has been changed.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setPwSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <Screen>
      <View style={[styles.profileHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Avatar name={`${user.firstName} ${user.lastName}`} size={72} />
        <Text style={[styles.name, { color: colors.text }]}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        <Badge label={user.role} tone="brand" />
      </View>

      {!editing ? (
        <Button title="Edit Profile" onPress={() => setEditing(true)} />
      ) : (
        <View style={styles.form}>
          <TextField label="First name" value={firstName} onChangeText={setFirstName} />
          <TextField label="Last name" value={lastName} onChangeText={setLastName} />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label="Business name" value={businessName} onChangeText={setBusinessName} />
          <TextField label="Business type" value={businessType} onChangeText={setBusinessType} />
          <TextField label="Website" value={website} onChangeText={setWebsite} keyboardType="url" />
          <TextField label="Description" value={description} onChangeText={setDescription} multiline />
          <TextField label="Address" value={address} onChangeText={setAddress} />
          <TextField label="State" value={stateValue} onChangeText={setStateValue} />
          <TextField label="City" value={city} onChangeText={setCity} />
          <Button title="Save" onPress={saveProfile} loading={saving} />
          <Button title="Cancel" variant="secondary" onPress={() => setEditing(false)} />
        </View>
      )}

      <Text style={[styles.section, { color: colors.text }]}>Change password</Text>
      {!showPassword ? (
        <Button title="Change Password" variant="secondary" onPress={() => setShowPassword(true)} />
      ) : (
        <View style={styles.form}>
          {pwError ? <Text style={[styles.error, { color: '#E5484D' }]}>{pwError}</Text> : null}
          <TextField
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextField
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextField
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button title="Update Password" onPress={submitPassword} loading={pwSaving} />
          <Button title="Cancel" variant="secondary" onPress={() => setShowPassword(false)} />
        </View>
      )}

      <Button title="Sign Out" variant="danger" onPress={confirmLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
  },
  name: { fontSize: 20, fontWeight: '800' },
  email: { fontSize: 14 },
  section: { fontSize: 17, fontWeight: '700', marginTop: 8 },
  form: { gap: 4 },
  error: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
});
