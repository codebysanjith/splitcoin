import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';

export function SettleUpScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { getGroup, calculateSettlement, settleGroup } = useApp();
  const { groupId } = route.params;

  const group = getGroup(groupId);
  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: Colors.light, textAlign: 'center', marginTop: 40 }}>
          Group not found
        </Text>
      </SafeAreaView>
    );
  }

  const settlements = calculateSettlement(groupId);

  const getMemberName = (id: string) =>
    group.members.find(m => m.id === id)?.name || id;

  const handleConfirm = () => {
    if (settlements.length === 0) {
      Alert.alert('All settled!', 'No settlements needed.');
      return;
    }
    Alert.alert(
      'Confirm Settlement',
      `This will settle all balances in ${group.name}. All expenses will be cleared. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle',
          style: 'destructive',
          onPress: () => {
            settleGroup(groupId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Settlement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoEmoji}>✅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Optimized Payment Path</Text>
            <Text style={styles.infoSubtitle}>Minimum transactions needed</Text>
            <Text style={styles.infoDesc}>
              Our smart algorithm minimizes the number of transactions required to settle all balances in this group.
            </Text>
          </View>
        </View>

        {settlements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>All Settled!</Text>
            <Text style={styles.emptySubtitle}>No outstanding balances in this group.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>
              PAYMENT PATH ({settlements.length}{' '}
              {settlements.length === 1 ? 'TRANSACTION' : 'TRANSACTIONS'})
            </Text>

            {settlements.map((s, i) => (
              <View key={i} style={styles.settlementCard}>
                {/* From */}
                <View style={styles.person}>
                  <View style={[styles.personAvatar, { backgroundColor: Colors.redLight }]}>
                    <Text style={[styles.personAvatarText, { color: Colors.red }]}>
                      {getMemberName(s.from).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.personName}>{getMemberName(s.from)}</Text>
                  <Text style={styles.personRole}>Pays</Text>
                </View>

                {/* Arrow + Amount */}
                <View style={styles.arrowSection}>
                  <Text style={styles.arrow}>→</Text>
                  <View style={styles.amountBadge}>
                    <Text style={styles.amount}>₹{s.amount.toLocaleString()}</Text>
                  </View>
                </View>

                {/* To */}
                <View style={styles.person}>
                  <View style={[styles.personAvatar, { backgroundColor: Colors.greenLight }]}>
                    <Text style={[styles.personAvatarText, { color: Colors.green }]}>
                      {getMemberName(s.to).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.personName}>{getMemberName(s.to)}</Text>
                  <Text style={styles.personRole}>Receives</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {settlements.length > 0 && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={styles.confirmBtnText}>Confirm Settlement</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: Colors.dark },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.dark },
  scroll: { padding: 16 },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoEmoji: { fontSize: 22 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  infoSubtitle: { fontSize: 13, color: Colors.light, marginBottom: 8 },
  infoDesc: { fontSize: 13, color: Colors.medium, lineHeight: 18 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.medium, textAlign: 'center' },
  settlementCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  person: { flex: 1, alignItems: 'center', gap: 6 },
  personAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  personAvatarText: { fontSize: 20, fontWeight: '700' },
  personName: { fontSize: 14, fontWeight: '600', color: Colors.dark, textAlign: 'center' },
  personRole: { fontSize: 12, color: Colors.light },
  arrowSection: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  arrow: { fontSize: 24, color: Colors.primary },
  amountBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  amount: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  confirmBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
