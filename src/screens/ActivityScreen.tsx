import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  isUnread: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'expense_added',
    title: 'New expense added',
    description: "Sarah added 'Dinner at Italian Restaurant' in Weekend Trip",
    timestamp: '2 hours ago',
    amount: 2400,
    isUnread: true,
  },
  {
    id: '2',
    type: 'settlement',
    title: 'Payment received',
    description: 'John paid you ₹1,500 for Apartment Rent',
    timestamp: '5 hours ago',
    amount: 1500,
    isUnread: true,
  },
  {
    id: '3',
    type: 'expense_updated',
    title: 'Expense updated',
    description: "You updated 'Grocery Shopping' amount from ₹800 to ₹900",
    timestamp: 'Yesterday',
    amount: 900,
    isUnread: false,
  },
  {
    id: '4',
    type: 'group_created',
    title: 'New group created',
    description: "You created 'Office Lunch' with 5 members",
    timestamp: '2 days ago',
    isUnread: false,
  },
  {
    id: '5',
    type: 'member_added',
    title: 'Member joined',
    description: 'Mike was added to Smart Settlement Demo',
    timestamp: '3 days ago',
    isUnread: false,
  },
  {
    id: '6',
    type: 'settlement',
    title: 'Settlement completed',
    description: 'All balances settled in Monthly Expenses',
    timestamp: '1 week ago',
    isUnread: false,
  },
];

function getIconAndColor(type: string): { emoji: string; bg: string; color: string } {
  switch (type) {
    case 'expense_added':
      return { emoji: '➕', bg: Colors.primaryLight, color: Colors.primary };
    case 'expense_updated':
      return { emoji: '✏️', bg: Colors.amberLight, color: Colors.amber };
    case 'expense_deleted':
      return { emoji: '🗑️', bg: Colors.redLight, color: Colors.red };
    case 'group_created':
      return { emoji: '👥', bg: Colors.purpleLight, color: Colors.purple };
    case 'member_added':
      return { emoji: '👤', bg: Colors.blueLight, color: Colors.blue };
    case 'settlement':
      return { emoji: '💰', bg: Colors.greenLight, color: Colors.green };
    default:
      return { emoji: '📌', bg: Colors.muted, color: Colors.medium };
  }
}

export function ActivityScreen() {
  const { user, logout } = useApp();
  const navigation = useNavigation<any>();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigation.replace('Login');
  };

  const unread = notifications.filter(n => n.isUnread);
  const earlier = notifications.filter(n => !n.isUnread);

  const renderNotification = (notification: Notification, highlighted = false) => {
    const { emoji, bg, color } = getIconAndColor(notification.type);
    return (
      <View
        key={notification.id}
        style={[
          styles.notifCard,
          highlighted && { borderLeftWidth: 3, borderLeftColor: color },
        ]}>
        <View style={[styles.notifIcon, { backgroundColor: bg }]}>
          <Text style={styles.notifEmoji}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.notifTitleRow}>
            <Text style={styles.notifTitle}>{notification.title}</Text>
            {notification.isUnread && <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />}
          </View>
          <Text style={styles.notifDesc}>{notification.description}</Text>
          <View style={styles.notifMeta}>
            <Text style={styles.notifTime}>{notification.timestamp}</Text>
            {notification.amount && (
              <Text style={[styles.notifAmount, { color: highlighted ? color : Colors.medium }]}>
                ₹{notification.amount.toLocaleString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
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
        {unread.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>NEW</Text>
            {unread.map(n => renderNotification(n, true))}
          </>
        )}
        <Text style={styles.sectionLabel}>EARLIER</Text>
        {earlier.map(n => renderNotification(n, false))}
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 12,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  notifCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifEmoji: { fontSize: 18 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  notifDesc: { fontSize: 13, color: Colors.medium, lineHeight: 18, marginBottom: 8 },
  notifMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  notifTime: { fontSize: 12, color: Colors.light },
  notifAmount: { fontSize: 13, fontWeight: '600' },
});
