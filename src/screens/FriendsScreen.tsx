import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';

interface Friend {
  id: string;
  name: string;
  email: string;
  balance: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const dummyFriends: Friend[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', balance: 2400 },
  { id: '2', name: 'John Smith', email: 'john@example.com', balance: -12000 },
  { id: '3', name: 'Mike Chen', email: 'mike@example.com', balance: 600 },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com', balance: -1500 },
  { id: '5', name: 'Alex Brown', email: 'alex@example.com', balance: 0 },
];

const dummySettlements: Settlement[] = [
  { from: 'John Smith', to: 'Sarah Johnson', amount: 8400 },
  { from: 'Emma Davis', to: 'Mike Chen', amount: 1500 },
];

type FilterType = 'all' | 'owe' | 'get';

export function FriendsScreen() {
  const { user, logout } = useApp();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigation.replace('Login');
  };

  const filteredFriends = dummyFriends.filter(f => {
    if (filter === 'owe') return f.balance < 0;
    if (filter === 'get') return f.balance > 0;
    return true;
  });

  const totalOwed = dummyFriends.reduce((s, f) => (f.balance < 0 ? s + Math.abs(f.balance) : s), 0);
  const totalToGet = dummyFriends.reduce((s, f) => (f.balance > 0 ? s + f.balance : s), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => setShowUserMenu(true)}
          activeOpacity={0.8}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showUserMenu} animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowUserMenu(false)} activeOpacity={1}>
          <View style={styles.userMenu}>
            <View style={styles.userMenuHeader}>
              <Text style={styles.userMenuName}>{user.name}</Text>
              <Text style={styles.userMenuEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Smart Settlement Card */}
        <View style={styles.settlementCard}>
          <View style={styles.settlementCardHeader}>
            <View style={styles.settlementCardLeft}>
              <View style={styles.settlementIcon}>
                <Text>✅</Text>
              </View>
              <View>
                <Text style={styles.settlementTitle}>Smart Settlement</Text>
                <Text style={styles.settlementSubtitle}>Optimized payment path</Text>
              </View>
            </View>
            <View style={styles.settlementBadge}>
              <Text style={styles.settlementBadgeText}>{dummySettlements.length} transactions</Text>
            </View>
          </View>

          <View style={styles.settlementPaths}>
            <Text style={styles.settlementDesc}>
              Our smart algorithm minimizes transactions to settle all balances efficiently.
            </Text>
            {dummySettlements.map((s, i) => (
              <View key={i} style={styles.settlementPath}>
                <View style={styles.pathPerson}>
                  <View style={[styles.pathAvatar, { backgroundColor: Colors.redLight }]}>
                    <Text style={[styles.pathAvatarText, { color: Colors.red }]}>
                      {s.from.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.pathName} numberOfLines={1}>{s.from.split(' ')[0]}</Text>
                </View>
                <View style={styles.pathArrow}>
                  <Text style={styles.pathArrowText}>→</Text>
                  <View style={styles.pathAmountBadge}>
                    <Text style={styles.pathAmount}>₹{s.amount.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.pathPerson}>
                  <View style={[styles.pathAvatar, { backgroundColor: Colors.greenLight }]}>
                    <Text style={[styles.pathAvatarText, { color: Colors.green }]}>
                      {s.to.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.pathName} numberOfLines={1}>{s.to.split(' ')[0]}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.settlementBtn} activeOpacity={0.85}>
            <Text style={styles.settlementBtnText}>View Full Settlement</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.redLight }]}>
            <Text style={[styles.summaryLabel, { color: '#991B1B' }]}>You owe</Text>
            <Text style={[styles.summaryAmount, { color: Colors.red }]}>
              ₹{totalOwed.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.greenLight }]}>
            <Text style={[styles.summaryLabel, { color: '#166534' }]}>You get</Text>
            <Text style={[styles.summaryAmount, { color: Colors.green }]}>
              ₹{totalToGet.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {(['all', 'owe', 'get'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}>
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f === 'all' ? 'All' : f === 'owe' ? 'You Owe' : 'You Get'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>YOUR FRIENDS</Text>

        {filteredFriends.map(friend => (
          <View key={friend.id} style={styles.friendCard}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendAvatarText}>{friend.name.charAt(0)}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendEmail}>{friend.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {friend.balance === 0 ? (
                <Text style={styles.settledText}>Settled</Text>
              ) : (
                <>
                  <Text style={styles.friendBalanceLabel}>
                    {friend.balance > 0 ? 'owes you' : 'you owe'}
                  </Text>
                  <Text
                    style={[
                      styles.friendBalance,
                      { color: friend.balance > 0 ? Colors.green : Colors.red },
                    ]}>
                    ₹{Math.abs(friend.balance).toLocaleString()}
                  </Text>
                </>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 16,
  },
  userMenu: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 220,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  userMenuHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  userMenuName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  userMenuEmail: { fontSize: 13, color: Colors.light, marginTop: 2 },
  logoutBtn: { padding: 14, paddingHorizontal: 16 },
  logoutText: { fontSize: 14, fontWeight: '500', color: Colors.red },
  scroll: { padding: 16 },
  settlementCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settlementCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  settlementCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settlementIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settlementTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  settlementSubtitle: { fontSize: 13, color: Colors.light, marginTop: 2 },
  settlementBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  settlementBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  settlementPaths: { backgroundColor: Colors.background, borderRadius: 14, padding: 14, marginBottom: 14 },
  settlementDesc: { fontSize: 13, color: Colors.medium, marginBottom: 12 },
  settlementPath: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pathPerson: { flex: 1, alignItems: 'center', gap: 4 },
  pathAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  pathAvatarText: { fontSize: 16, fontWeight: '700' },
  pathName: { fontSize: 12, fontWeight: '500', color: Colors.dark },
  pathArrow: { alignItems: 'center', paddingHorizontal: 8 },
  pathArrowText: { fontSize: 20, color: Colors.primary, lineHeight: 24 },
  pathAmountBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pathAmount: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  settlementBtn: {
    height: 46,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settlementBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 18, padding: 16 },
  summaryLabel: { fontSize: 13, marginBottom: 4 },
  summaryAmount: { fontSize: 22, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.muted },
  filterChipActive: { backgroundColor: Colors.dark },
  filterChipText: { fontSize: 14, fontWeight: '500', color: Colors.medium },
  filterChipTextActive: { color: Colors.white },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  friendCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  friendEmail: { fontSize: 13, color: Colors.light, marginTop: 2 },
  settledText: { fontSize: 14, fontWeight: '500', color: Colors.light },
  friendBalanceLabel: { fontSize: 12, color: Colors.medium, marginBottom: 2 },
  friendBalance: { fontSize: 16, fontWeight: '700' },
});
