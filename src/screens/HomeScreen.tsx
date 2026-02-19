import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';

type FilterType = 'all' | 'owe' | 'get';

function getCategoryColor(category: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    trip: { bg: Colors.amberLight, text: Colors.amber },
    home: { bg: Colors.blueLight, text: Colors.blue },
    food: { bg: Colors.greenLight, text: Colors.green },
    event: { bg: Colors.purpleLight, text: Colors.purple },
    other: { bg: Colors.primaryLight, text: Colors.primary },
    'Travel': { bg: Colors.amberLight, text: Colors.amber },
    'Rent': { bg: Colors.blueLight, text: Colors.blue },
  };
  return colors[category] || colors.other;
}

export function HomeScreen() {
  const { user, groups, logout } = useApp();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalOwed = groups.reduce((s, g) => (g.balance < 0 ? s + Math.abs(g.balance) : s), 0);
  const totalToGet = groups.reduce((s, g) => (g.balance > 0 ? s + g.balance : s), 0);
  const netBalance = totalToGet - totalOwed;
  const unsettledCount = groups.filter(g => g.balance !== 0).length;

  const filteredGroups = groups.filter(g => {
    if (filter === 'owe') return g.balance < 0;
    if (filter === 'get') return g.balance > 0;
    return true;
  });

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => setShowUserMenu(true)}
          activeOpacity={0.8}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Net Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Net Balance</Text>
          <View style={styles.balanceCenter}>
            <Text
              style={[
                styles.balanceAmount,
                { color: netBalance === 0 ? Colors.light : netBalance > 0 ? Colors.green : Colors.red },
              ]}>
              {netBalance === 0
                ? '₹0'
                : `${netBalance > 0 ? '+' : ''}₹${Math.abs(netBalance).toLocaleString()}`}
            </Text>
            <Text
              style={[
                styles.balanceSubtext,
                { color: netBalance === 0 ? Colors.light : netBalance > 0 ? Colors.green : Colors.red },
              ]}>
              {netBalance > 0
                ? '↑ You\'re getting back'
                : netBalance < 0
                ? '↓ You owe overall'
                : 'All settled up!'}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>You owe</Text>
              <Text style={[styles.balanceStatAmount, { color: Colors.red }]}>
                ₹{totalOwed.toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>You get</Text>
              <Text style={[styles.balanceStatAmount, { color: Colors.green }]}>
                ₹{totalToGet.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Chips */}
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

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>📁</Text>
            </View>
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptySubtitle}>Create your first group to start splitting expenses</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreateGroup')}
              activeOpacity={0.85}>
              <Text style={styles.createBtnText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>YOUR GROUPS</Text>

            {filteredGroups.map(group => {
              const catColor = getCategoryColor(group.category);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                  activeOpacity={0.85}>
                  <View style={styles.groupCardTop}>
                    <View style={styles.groupCardLeft}>
                      <View style={styles.groupNameRow}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <View style={[styles.catBadge, { backgroundColor: catColor.bg }]}>
                          <Text style={[styles.catBadgeText, { color: catColor.text }]}>
                            {group.category}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.groupMeta}>
                        {group.members.length} members • ₹{group.totalSpend.toLocaleString()} total
                      </Text>
                    </View>
                  </View>
                  <View style={styles.groupCardBottom}>
                    <View>
                      <Text style={styles.balanceStatLabel}>Your balance</Text>
                      <Text
                        style={[
                          styles.groupBalance,
                          {
                            color:
                              group.balance === 0
                                ? Colors.light
                                : group.balance > 0
                                ? Colors.green
                                : Colors.red,
                          },
                        ]}>
                        {group.balance === 0
                          ? 'Settled'
                          : `${group.balance > 0 ? '+' : ''}₹${Math.abs(group.balance).toLocaleString()}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                      activeOpacity={0.7}>
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Insight Card */}
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Text>💡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>Quick Insight</Text>
                <Text style={styles.insightText}>
                  {unsettledCount === 0
                    ? 'Great! All your groups are settled.'
                    : `You have ${unsettledCount} group${unsettledCount > 1 ? 's' : ''} with unsettled balances.`}
                </Text>
              </View>
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* FAB */}
      {groups.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateGroup')}
          activeOpacity={0.85}>
          <Text style={styles.fabText}>+ Add Spend</Text>
        </TouchableOpacity>
      )}

      {/* User Menu Modal */}
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
  welcomeText: { fontSize: 13, color: Colors.light, marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 100 },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceLabel: { fontSize: 14, fontWeight: '600', color: Colors.medium, marginBottom: 16 },
  balanceCenter: { alignItems: 'center', marginBottom: 20 },
  balanceAmount: { fontSize: 42, fontWeight: '700', lineHeight: 48 },
  balanceSubtext: { fontSize: 14, fontWeight: '500', marginTop: 6 },
  balanceDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  balanceRow: { flexDirection: 'row' },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatLabel: { fontSize: 12, color: Colors.light, marginBottom: 4 },
  balanceStatAmount: { fontSize: 20, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.muted,
  },
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
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  groupCardTop: { marginBottom: 12 },
  groupCardLeft: { flex: 1 },
  groupNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  groupName: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: '500' },
  groupMeta: { fontSize: 13, color: Colors.light },
  groupCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupBalance: { fontSize: 18, fontWeight: '700' },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  insightCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 2 },
  insightText: { fontSize: 13, color: '#78350F', lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.light, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  createBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  createBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
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
});
