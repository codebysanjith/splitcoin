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

export function DashboardScreen() {
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

  const getActionButton = (balance: number) => {
    if (balance > 0) return { label: 'Settle', bg: Colors.primary, color: Colors.white };
    if (balance < 0) return { label: 'Remind', bg: Colors.amberLight, color: '#92400E' };
    return { label: 'Settled', bg: Colors.muted, color: Colors.light };
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SplitCoin</Text>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => setShowUserMenu(true)}
          activeOpacity={0.8}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Card — gradient style */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryEmoji}>💸</Text>
            <Text style={[styles.summaryText, { color: Colors.red }]}>
              You owe ₹{totalOwed.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryEmoji}>📈</Text>
            <Text style={[styles.summaryText, { color: Colors.primary }]}>
              You are owed ₹{totalToGet.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <Text style={styles.netBalanceText}>
            Net Balance:{' '}
            <Text style={{ color: netBalance >= 0 ? Colors.green : Colors.red }}>
              {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}
            </Text>
          </Text>
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

        <Text style={styles.sectionLabel}>YOUR GROUPS</Text>

        {filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>➕</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No Groups Yet' : 'No Groups Match Filter'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'Create your first group to start splitting expenses!'
                : 'Try changing the filter to see more groups.'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => navigation.navigate('CreateGroup')}
                activeOpacity={0.85}>
                <Text style={styles.createBtnText}>Create Your First Group</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredGroups.map(group => {
            const action = getActionButton(group.balance);
            return (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                activeOpacity={0.85}>
                <View style={styles.groupCardTop}>
                  <View style={styles.groupCardLeft}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <View style={styles.groupMeta}>
                      <View style={[styles.dot, { backgroundColor: group.status === 'Active' ? Colors.green : Colors.amber }]} />
                      <Text style={styles.groupMetaText}>{group.category}</Text>
                    </View>
                    <View style={styles.groupMeta}>
                      <View style={[styles.dot, { backgroundColor: Colors.amber }]} />
                      <Text style={styles.groupMetaText}>{group.lastActivity}</Text>
                    </View>
                  </View>
                  <View style={styles.groupCardRight}>
                    <Text
                      style={[
                        styles.groupBalance,
                        { color: group.balance >= 0 ? Colors.green : Colors.red },
                      ]}>
                      {group.balance >= 0 ? 'You get' : 'You owe'} ₹
                      {Math.abs(group.balance).toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: action.bg }]}
                      onPress={e => {
                        navigation.navigate('SettleUp', { groupId: group.id });
                      }}
                      activeOpacity={0.8}>
                      <Text style={[styles.actionBtnText, { color: action.color }]}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Insight card */}
        {groups.length > 0 && unsettledCount > 0 && (
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Text>💡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>💡 Insight</Text>
              <Text style={styles.insightText}>
                You have {unsettledCount} unsettled balance{unsettledCount > 1 ? 's' : ''}.
              </Text>
            </View>
          </View>
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
      <Modal
        transparent
        visible={showUserMenu}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowUserMenu(false)}
          activeOpacity={1}>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.medium },
  scroll: { padding: 16, paddingBottom: 100 },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    // Simulating the gradient with a light two-tone look
    backgroundColor: '#FEF3F3',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryEmoji: { fontSize: 16 },
  summaryText: { fontSize: 14, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 12 },
  netBalanceText: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
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
  groupCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  groupCardLeft: { flex: 1, marginRight: 12 },
  groupName: { fontSize: 17, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  groupMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  groupMetaText: { fontSize: 13, color: Colors.medium },
  groupCardRight: { alignItems: 'flex-end', gap: 8 },
  groupBalance: { fontSize: 16, fontWeight: '700' },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
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
  emptySubtitle: { fontSize: 14, color: Colors.medium, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  createBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  createBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  insightCard: {
    backgroundColor: Colors.amberLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 18,
    padding: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  insightText: { fontSize: 14, color: '#78350F', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
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
