import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp, type Member } from '../context/AppContext';
import { Colors } from '../theme';

export function MemberSettingsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { getGroup, updateMember, removeMember, getMemberBalance } = useApp();
  const { groupId } = route.params;

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const group = getGroup(groupId);

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Group not found</Text>
      </SafeAreaView>
    );
  }

  const startEditing = (member: Member) => {
    setEditingMemberId(member.id);
    setEditName(member.name);
    setEditEmail(member.email);
    setConfirmRemoveId(null);
  };

  const saveEdit = () => {
    if (editingMemberId && editName.trim()) {
      updateMember(groupId, editingMemberId, { name: editName.trim(), email: editEmail.trim() });
      setEditingMemberId(null);
    }
  };

  const cancelEdit = () => {
    setEditingMemberId(null);
    setEditName('');
    setEditEmail('');
  };

  const handleRemove = (memberId: string) => {
    removeMember(groupId, memberId);
    setConfirmRemoveId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Members</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>GROUP MEMBERS</Text>

        {group.members.map(member => {
          const balance = getMemberBalance(groupId, member.id);
          const isEditing = editingMemberId === member.id;
          const isConfirmingRemove = confirmRemoveId === member.id;

          return (
            <View key={member.id} style={styles.memberCard}>
              {isEditing ? (
                /* ── Edit Mode ─────────────────────────────────────── */
                <View>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Member name"
                    placeholderTextColor={Colors.light}
                    autoFocus
                  />
                  <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="email@example.com"
                    placeholderTextColor={Colors.light}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={saveEdit}
                      activeOpacity={0.85}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={cancelEdit}
                      activeOpacity={0.85}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* ── View Mode ─────────────────────────────────────── */
                <>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                      {balance !== 0 && (
                        <Text
                          style={[
                            styles.memberBalance,
                            { color: balance > 0 ? Colors.green : Colors.red },
                          ]}>
                          {balance > 0 ? 'Gets' : 'Owes'} ₹{Math.abs(balance).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => startEditing(member)}
                      activeOpacity={0.8}>
                      <Text style={styles.editBtnText}>✏️  Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => {
                        setConfirmRemoveId(member.id);
                        setEditingMemberId(null);
                      }}
                      activeOpacity={0.8}>
                      <Text style={styles.removeBtnText}>🗑️  Remove</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Remove confirmation */}
                  {isConfirmingRemove && (
                    <View style={styles.confirmBox}>
                      <View style={styles.confirmHeader}>
                        <Text style={styles.confirmIcon}>⚠️</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.confirmTitle}>Remove {member.name}?</Text>
                          {balance !== 0 && (
                            <Text style={styles.confirmWarning}>
                              This member has an active balance of ₹{Math.abs(balance).toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.confirmActions}>
                        <TouchableOpacity
                          style={styles.confirmRemoveBtn}
                          onPress={() => handleRemove(member.id)}
                          activeOpacity={0.85}>
                          <Text style={styles.confirmRemoveBtnText}>Confirm Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.confirmCancelBtn}
                          onPress={() => setConfirmRemoveId(null)}
                          activeOpacity={0.85}>
                          <Text style={styles.confirmCancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { color: Colors.light, textAlign: 'center', marginTop: 40 },
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  memberCard: {
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
  // View mode
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  memberDetails: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  memberEmail: { fontSize: 13, color: Colors.light, marginBottom: 4 },
  memberBalance: { fontSize: 14, fontWeight: '600' },
  memberActions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  removeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.redLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.red },
  // Confirm remove
  confirmBox: {
    marginTop: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 14,
  },
  confirmHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  confirmIcon: { fontSize: 18, lineHeight: 22 },
  confirmTitle: { fontSize: 13, fontWeight: '600', color: '#9A3412', marginBottom: 4 },
  confirmWarning: { fontSize: 12, color: '#C2410C' },
  confirmActions: { flexDirection: 'row', gap: 8 },
  confirmRemoveBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmRemoveBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  confirmCancelBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: { fontSize: 13, fontWeight: '600', color: Colors.medium },
  // Edit mode
  fieldLabel: { fontSize: 12, color: Colors.light, marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.dark,
    backgroundColor: Colors.white,
  },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  saveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.medium },
});
