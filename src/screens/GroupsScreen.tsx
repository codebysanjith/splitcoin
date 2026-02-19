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

export function GroupsScreen() {
  const { user, groups, logout } = useApp();
  const navigation = useNavigation<any>();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigation.replace('Login');
  };

  const totalYouOwe = groups.reduce((s, g) => (g.balance < 0 ? s + Math.abs(g.balance) : s), 0);
  const totalYouGet = groups.reduce((s, g) => (g.balance > 0 ? s + g.balance : s), 0);
  const totalMembers = new Set(groups.flatMap(g => g.members.map(m => m.id))).size;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Welcome back</Text>
          <Text style={styles.headerTitle}>Groups</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => setShowUserMenu(true)} activeOpacity={0.8}>
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
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.statLabel, { color: Colors.primary }]}>Total Groups</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{groups.length}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.purpleLight }]}>
            <Text style={[styles.statLabel, { color: Colors.purple }]}>Total Members</Text>
            <Text style={[styles.statValue, { color: Colors.purple }]}>{totalMembers}</Text>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCardTitle}>Overall Balance</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.balanceLabel, { color: Colors.red }]}>You owe</Text>
              <Text style={[styles.balanceAmount, { color: Colors.red }]}>
                ₹{totalYouOwe.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text style={[styles.balanceLabel, { color: Colors.green }]}>You get</Text>
              <Text style={[styles.balanceAmount, { color: Colors.green }]}>
                ₹{totalYouGet.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📁</Text>
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
            <Text style={styles.sectionLabel}>ALL GROUPS ({groups.length})</Text>
            {groups.map(group => {
              const catColor = getCategoryColor(group.category);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                  activeOpacity={0.85}>
                  <View style={styles.groupCardTop}>
                    <View style={styles.groupNameRow}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <View style={[styles.catBadge, { backgroundColor: catColor.bg }]}>
                        <Text style={[styles.catBadgeText, { color: catColor.text }]}>
                          {group.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.groupMeta}>
                      {group.members.length} members • ₹{group.totalSpend.toLocaleString()} spent
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.groupBalanceLabel}>Your balance</Text>
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
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
        activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  headerSub: { fontSize: 13, color: Colors.light, marginBottom: 2 },
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
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 18, padding: 16 },
  statLabel: { fontSize: 13, marginBottom: 4 },
  statValue: { fontSize: 30, fontWeight: '700' },
  balanceCard: {
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
  balanceCardTitle: { fontSize: 14, fontWeight: '600', color: Colors.medium, marginBottom: 14 },
  balanceRow: { flexDirection: 'row', gap: 40 },
  balanceLabel: { fontSize: 12, marginBottom: 4 },
  balanceAmount: { fontSize: 22, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.light, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  createBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  createBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
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
  groupNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  groupName: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: '500' },
  groupMeta: { fontSize: 13, color: Colors.light },
  groupBalanceLabel: { fontSize: 12, color: Colors.light, marginBottom: 4 },
  groupBalance: { fontSize: 18, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: Colors.white, fontSize: 28, fontWeight: '300', lineHeight: 30 },
});
