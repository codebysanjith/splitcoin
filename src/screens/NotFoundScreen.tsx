import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme';

export function NotFoundScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>The screen you're looking for doesn't exist.</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('MainTabs')}
          activeOpacity={0.85}>
          <Text style={styles.btnText}>🏠  Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  code: { fontSize: 80, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.medium, textAlign: 'center', marginBottom: 32 },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
