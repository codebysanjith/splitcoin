import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp, availableFriends, type Member } from '../context/AppContext';
import { Colors } from '../theme';

export function CreateGroupScreen() {
  const { addGroup } = useApp();
  const navigation = useNavigation<any>();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

  const filteredFriends = availableFriends.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase());
    const notSelected = !selectedMembers.find(m => m.id === f.id);
    return matchesSearch && notSelected;
  });

  const toggleMember = (friend: Member) => {
    const isSelected = selectedMembers.find(m => m.id === friend.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== friend.id));
    } else {
      setSelectedMembers([...selectedMembers, friend]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Missing name', 'Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('No members', 'Please add at least one friend to the group');
      return;
    }
    addGroup(groupName, selectedMembers);
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Create New Group</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Group Name */}
        <Text style={styles.fieldLabel}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Weekend Trip, Apartment Rent..."
          placeholderTextColor={Colors.light}
          value={groupName}
          onChangeText={setGroupName}
          autoFocus
        />

        {/* Selected Members */}
        {selectedMembers.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>Active Members ({selectedMembers.length})</Text>
            <View style={styles.selectedRow}>
              {selectedMembers.map(member => (
                <View key={member.id} style={styles.selectedChip}>
                  <View style={styles.selectedChipAvatar}>
                    <Text style={styles.selectedChipAvatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.selectedChipName}>{member.name}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedMembers(selectedMembers.filter(m => m.id !== member.id))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.selectedChipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Search Friends */}
        <Text style={styles.fieldLabel}>Add Friends</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={Colors.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Friends List */}
        <View style={styles.friendsList}>
          {filteredFriends.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 'No friends found' : 'All friends added!'}
            </Text>
          ) : (
            filteredFriends.map(friend => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendRow}
                onPress={() => toggleMember(friend)}
                activeOpacity={0.8}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendEmail}>{friend.email}</Text>
                </View>
                <View style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createBtn,
            (!groupName.trim() || selectedMembers.length === 0) && styles.createBtnDisabled,
          ]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedMembers.length === 0}
          activeOpacity={0.85}>
          <Text style={styles.createBtnText}>
            Create Group with {selectedMembers.length}{' '}
            {selectedMembers.length === 1 ? 'Friend' : 'Friends'}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
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
  scroll: { padding: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.medium, marginBottom: 8, marginTop: 4 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.dark,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  selectedChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChipAvatarText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  selectedChipName: { fontSize: 14, fontWeight: '500', color: Colors.dark },
  selectedChipRemove: { fontSize: 14, color: Colors.primary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    marginBottom: 12,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.dark },
  friendsList: { marginBottom: 20 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.medium },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  friendEmail: { fontSize: 13, color: Colors.light, marginTop: 2 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 20, color: Colors.primary, fontWeight: '300', lineHeight: 24 },
  emptyText: { textAlign: 'center', color: Colors.light, paddingVertical: 24, fontSize: 14 },
  createBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
