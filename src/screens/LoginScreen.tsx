import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, loginWithSaved, savedAccounts } = useApp();
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    login(email, password, remember);
    navigation.replace('MainTabs');
  };

  const handleSavedLogin = (id: string) => {
    loginWithSaved(id);
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <Text style={styles.logo}>SplitCoin</Text>

        {/* Login Card */}
        <View style={styles.card}>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Email Address"
            placeholderTextColor={Colors.light}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            onSubmitEditing={handleLogin}
          />

          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused, { marginTop: 12 }]}
            placeholder="Password"
            placeholderTextColor={Colors.light}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            onSubmitEditing={handleLogin}
          />

          {/* Remember Me */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRemember(!remember)}
            activeOpacity={0.7}>
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Save login info</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Accounts */}
        {savedAccounts.length > 0 && (
          <View style={styles.savedCard}>
            <Text style={styles.savedTitle}>Saved Accounts</Text>
            <View style={styles.savedRow}>
              {savedAccounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.savedAccount}
                  onPress={() => handleSavedLogin(account.id)}
                  activeOpacity={0.7}>
                  <View style={styles.savedAvatar}>
                    <Text style={styles.savedAvatarText}>
                      {account.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.savedName}>{account.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.dark,
    backgroundColor: Colors.white,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  rememberText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.medium,
  },
  loginBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.medium,
  },
  savedCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.medium,
    marginBottom: 16,
  },
  savedRow: {
    flexDirection: 'row',
    gap: 16,
  },
  savedAccount: {
    alignItems: 'center',
    gap: 6,
  },
  savedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  savedName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.dark,
  },
});
