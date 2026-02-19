import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';
import type { Expense } from '../context/AppContext';

export function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { getGroup, addExpense, user } = useApp();
  const { groupId } = route.params;

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [tax, setTax] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'unequal'>('equal');
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [unequalAmounts, setUnequalAmounts] = useState<Record<string, string>>({});

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

  const totalPercentage = Object.values(percentages).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const totalUnequalAmount = Object.values(unequalAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const expenseAmount = parseFloat(amount) || 0;
  const remainingAmount = expenseAmount - totalUnequalAmount;
  const remainingPercentage = 100 - totalPercentage;

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setTax('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setSplitType('equal');
    setPercentages({});
    setUnequalAmounts({});
  };

  const handleSaveExpense = () => {
    if (!amount || !description) {
      Alert.alert('Missing fields', 'Please fill in amount and description');
      return;
    }
    if (splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01) {
      Alert.alert('Invalid split', `Percentages must add up to 100%. Currently: ${totalPercentage.toFixed(1)}%`);
      return;
    }
    if (splitType === 'unequal' && Math.abs(remainingAmount) > 0.01) {
      Alert.alert('Invalid split', `Amount not fully allocated. Remaining: ₹${remainingAmount.toFixed(2)}`);
      return;
    }

    const percentageSplits =
      splitType === 'percentage'
        ? Object.entries(percentages).map(([memberId, percentage]) => ({
            memberId,
            percentage: parseFloat(percentage) || 0,
          }))
        : undefined;

    const unequalSplits =
      splitType === 'unequal'
        ? Object.entries(unequalAmounts).map(([memberId, amt]) => ({
            memberId,
            amount: parseFloat(amt) || 0,
          }))
        : undefined;

    addExpense(groupId, {
      description,
      amount: parseFloat(amount),
      date: expenseDate,
      paidBy: user.id,
      splitType,
      percentageSplits,
      unequalSplits,
      tax: tax ? parseFloat(tax) : undefined,
    });

    resetForm();
    setShowAddExpense(false);
  };

  const handleSplitTypeChange = (type: 'equal' | 'percentage' | 'unequal') => {
    setSplitType(type);
    if (type === 'percentage' && Object.keys(percentages).length === 0) {
      const equalPct = (100 / group.members.length).toFixed(1);
      const init: Record<string, string> = {};
      group.members.forEach(m => (init[m.id] = equalPct));
      setPercentages(init);
    }
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
        <Text style={styles.headerTitle} numberOfLines={1}>{group.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.settleBtn}
            onPress={() => navigation.navigate('MemberSettings', { groupId })}
            activeOpacity={0.8}>
            <Text style={styles.settleBtnText}>👥 Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settleBtn}
            onPress={() => navigation.navigate('SettleUp', { groupId })}
            activeOpacity={0.8}>
            <Text style={styles.settleBtnText}>Settle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Your Balance</Text>
          <Text
            style={[
              styles.summaryAmount,
              { color: group.balance >= 0 ? Colors.green : Colors.red },
            ]}>
            {group.balance >= 0 ? '+' : ''}₹{Math.abs(group.balance).toLocaleString()}
          </Text>
          <Text style={styles.summaryMeta}>
            Total spend: ₹{group.totalSpend.toLocaleString()} • {group.members.length} members
          </Text>
        </View>

        {/* Expenses */}
        <Text style={styles.sectionLabel}>EXPENSES</Text>

        {group.expenses.length === 0 ? (
          <Text style={styles.emptyText}>No expenses yet. Tap + to add one.</Text>
        ) : (
          group.expenses.map(expense => {
            const payer = group.members.find(m => m.id === expense.paidBy);
            return (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                onPress={() => setSelectedExpense(expense)}
                activeOpacity={0.85}>
                <View style={styles.expenseRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expenseDesc}>{expense.description}</Text>
                    <View style={styles.expenseMeta}>
                      <Text style={styles.expenseMetaText}>
                        📅 {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={styles.expenseMetaText}>
                        👥 {group.members.length} people
                      </Text>
                      {expense.splitType !== 'equal' && (
                        <Text style={[styles.expenseMetaText, { color: Colors.primary }]}>
                          {expense.splitType === 'percentage' ? '% Split' : 'Custom'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.expenseAmount}>₹{expense.amount.toLocaleString()}</Text>
                    <Text style={styles.expensePaidBy}>by {payer?.name || 'Unknown'}</Text>
                  </View>
                </View>
                {expense.tax ? (
                  <Text style={styles.taxText}>Tax/Tip: ₹{expense.tax}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddExpense(true)}
        activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Expense Bottom Sheet */}
      <Modal
        visible={showAddExpense}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddExpense(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setShowAddExpense(false)}
          activeOpacity={1}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Add Expense</Text>
                  <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                    <Text style={styles.sheetClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Amount */}
                  <Text style={styles.fieldLabel}>Amount (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={Colors.light}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />

                  {/* Description */}
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What was this for?"
                    placeholderTextColor={Colors.light}
                    value={description}
                    onChangeText={setDescription}
                  />

                  {/* Tax */}
                  <Text style={styles.fieldLabel}>Tax/Tip (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={Colors.light}
                    value={tax}
                    onChangeText={setTax}
                    keyboardType="numeric"
                  />

                  {/* Split Type */}
                  <Text style={styles.fieldLabel}>Split Type</Text>
                  <View style={styles.splitRow}>
                    {(['equal', 'percentage', 'unequal'] as const).map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.splitBtn, splitType === type && styles.splitBtnActive]}
                        onPress={() => handleSplitTypeChange(type)}
                        activeOpacity={0.7}>
                        <Text style={[styles.splitBtnText, splitType === type && styles.splitBtnTextActive]}>
                          {type === 'equal' ? 'Equal' : type === 'percentage' ? '%' : 'Custom'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Percentage Fields */}
                  {splitType === 'percentage' && (
                    <View style={styles.splitFields}>
                      <View style={styles.splitFieldsHeader}>
                        <Text style={styles.splitFieldsTitle}>Member Percentages</Text>
                        <View
                          style={[
                            styles.remainingBadge,
                            { backgroundColor: Math.abs(remainingPercentage) < 0.1 ? Colors.greenLight : Colors.redLight },
                          ]}>
                          <Text
                            style={[
                              styles.remainingText,
                              { color: Math.abs(remainingPercentage) < 0.1 ? Colors.green : Colors.red },
                            ]}>
                            {remainingPercentage >= 0 ? '+' : ''}{remainingPercentage.toFixed(1)}% remaining
                          </Text>
                        </View>
                      </View>
                      {group.members.map(member => (
                        <View key={member.id} style={styles.memberField}>
                          <Text style={styles.memberFieldName}>{member.name}</Text>
                          <View style={styles.memberFieldInput}>
                            <TextInput
                              style={styles.smallInput}
                              value={percentages[member.id] || ''}
                              onChangeText={v => setPercentages(p => ({ ...p, [member.id]: v }))}
                              placeholder="0"
                              placeholderTextColor={Colors.light}
                              keyboardType="numeric"
                            />
                            <Text style={styles.inputSuffix}>%</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Unequal Fields */}
                  {splitType === 'unequal' && (
                    <View style={styles.splitFields}>
                      <View style={styles.splitFieldsHeader}>
                        <Text style={styles.splitFieldsTitle}>Member Amounts</Text>
                        <View
                          style={[
                            styles.remainingBadge,
                            { backgroundColor: Math.abs(remainingAmount) < 0.1 ? Colors.greenLight : Colors.redLight },
                          ]}>
                          <Text
                            style={[
                              styles.remainingText,
                              { color: Math.abs(remainingAmount) < 0.1 ? Colors.green : Colors.red },
                            ]}>
                            ₹{remainingAmount.toFixed(2)} remaining
                          </Text>
                        </View>
                      </View>
                      {group.members.map(member => (
                        <View key={member.id} style={styles.memberField}>
                          <Text style={styles.memberFieldName}>{member.name}</Text>
                          <View style={styles.memberFieldInput}>
                            <TextInput
                              style={styles.smallInput}
                              value={unequalAmounts[member.id] || ''}
                              onChangeText={v => setUnequalAmounts(p => ({ ...p, [member.id]: v }))}
                              placeholder="0"
                              placeholderTextColor={Colors.light}
                              keyboardType="numeric"
                            />
                            <Text style={styles.inputSuffix}>₹</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveExpense}
                    activeOpacity={0.85}>
                    <Text style={styles.saveBtnText}>Save Expense</Text>
                  </TouchableOpacity>
                  <View style={{ height: 32 }} />
                </ScrollView>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Expense Detail Modal */}
      <Modal
        visible={!!selectedExpense}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedExpense(null)}>
        <TouchableOpacity
          style={styles.detailOverlay}
          onPress={() => setSelectedExpense(null)}
          activeOpacity={1}>
          {selectedExpense && (
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.detailModal}>
                <View style={styles.detailHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailTitle}>{selectedExpense.description}</Text>
                    <Text style={styles.detailSubtitle}>Expense Details</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedExpense(null)}>
                    <Text style={styles.sheetClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailAmountBox}>
                  <Text style={styles.detailAmountLabel}>Total Amount</Text>
                  <Text style={styles.detailAmount}>₹{selectedExpense.amount.toLocaleString()}</Text>
                  {selectedExpense.tax && (
                    <Text style={styles.detailTax}>Includes tax/tip: ₹{selectedExpense.tax}</Text>
                  )}
                </View>

                {/* Date / Split Type info rows */}
                <View style={styles.detailInfoRow}>
                  <View style={styles.detailInfoIcon}>
                    <Text>📅</Text>
                  </View>
                  <View>
                    <Text style={styles.detailInfoLabel}>Date</Text>
                    <Text style={styles.detailInfoValue}>
                      {new Date(selectedExpense.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailInfoRow}>
                  <View style={styles.detailInfoIcon}>
                    <Text>
                      {selectedExpense.splitType === 'percentage' ? '%' : '👥'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailInfoLabel}>Split Type</Text>
                    <Text style={styles.detailInfoValue}>
                      {selectedExpense.splitType === 'percentage'
                        ? 'Percentage Split'
                        : selectedExpense.splitType === 'unequal'
                        ? 'Unequal Split'
                        : 'Equal Split'}
                    </Text>
                  </View>
                </View>

                {/* Participants */}
                {(() => {
                  let participantCount = group.members.length;
                  if (selectedExpense.splitType === 'percentage' && selectedExpense.percentageSplits) {
                    participantCount = selectedExpense.percentageSplits.filter(s => s.percentage > 0).length || group.members.length;
                  } else if (selectedExpense.splitType === 'unequal' && selectedExpense.unequalSplits) {
                    participantCount = selectedExpense.unequalSplits.filter(s => s.amount > 0).length || group.members.length;
                  }
                  return (
                    <Text style={styles.detailSectionLabel}>PARTICIPANTS ({participantCount})</Text>
                  );
                })()}

                {selectedExpense.splitType === 'percentage' && selectedExpense.percentageSplits
                  ? selectedExpense.percentageSplits
                      .filter(split => split.percentage > 0)
                      .map(split => {
                        const member = group.members.find(m => m.id === split.memberId);
                        const shareAmount = (selectedExpense.amount * split.percentage) / 100;
                        return (
                          <View key={split.memberId} style={styles.participantRow}>
                            <View style={styles.participantAvatar}>
                              <Text style={styles.participantAvatarText}>
                                {member?.name?.charAt(0).toUpperCase() || '?'}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.participantName}>{member?.name || split.memberId}</Text>
                              <Text style={styles.participantSubLabel}>{split.percentage}% share</Text>
                            </View>
                            <Text style={styles.participantShare}>₹{shareAmount.toFixed(2)}</Text>
                          </View>
                        );
                      })
                  : selectedExpense.splitType === 'unequal' && selectedExpense.unequalSplits
                  ? selectedExpense.unequalSplits
                      .filter(split => split.amount > 0)
                      .map(split => {
                        const member = group.members.find(m => m.id === split.memberId);
                        return (
                          <View key={split.memberId} style={styles.participantRow}>
                            <View style={styles.participantAvatar}>
                              <Text style={styles.participantAvatarText}>
                                {member?.name?.charAt(0).toUpperCase() || '?'}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.participantName}>{member?.name || split.memberId}</Text>
                              <Text style={styles.participantSubLabel}>Custom amount</Text>
                            </View>
                            <Text style={styles.participantShare}>₹{split.amount.toFixed(2)}</Text>
                          </View>
                        );
                      })
                  : group.members.map(member => {
                      const shareAmount = selectedExpense.amount / group.members.length;
                      return (
                        <View key={member.id} style={styles.participantRow}>
                          <View style={styles.participantAvatar}>
                            <Text style={styles.participantAvatarText}>
                              {member.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.participantName}>{member.name}</Text>
                            <Text style={styles.participantSubLabel}>Equal share</Text>
                          </View>
                          <Text style={styles.participantShare}>₹{shareAmount.toFixed(2)}</Text>
                        </View>
                      );
                    })}

                {/* Paid By */}
                <View style={styles.paidByBox}>
                  <Text style={styles.paidByLabel}>PAID BY</Text>
                  <Text style={styles.paidByName}>
                    {group.members.find(m => m.id === selectedExpense.paidBy)?.name || selectedExpense.paidBy}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => setSelectedExpense(null)}
                  activeOpacity={0.85}>
                  <Text style={styles.saveBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '600', color: Colors.dark },
  settleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  settleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  scroll: { padding: 16 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: { fontSize: 14, color: Colors.light, marginBottom: 8 },
  summaryAmount: { fontSize: 36, fontWeight: '700', marginBottom: 8 },
  summaryMeta: { fontSize: 13, color: Colors.medium },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyText: { textAlign: 'center', color: Colors.light, paddingVertical: 40 },
  expenseCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  expenseRow: { flexDirection: 'row', alignItems: 'flex-start' },
  expenseDesc: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 6 },
  expenseMeta: { flexDirection: 'row', gap: 10 },
  expenseMetaText: { fontSize: 12, color: Colors.light },
  expenseAmount: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  expensePaidBy: { fontSize: 11, color: Colors.light, marginTop: 4 },
  taxText: { fontSize: 12, color: Colors.medium, marginTop: 6 },
  fab: {
    position: 'absolute',
    bottom: 32,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark },
  sheetClose: { fontSize: 18, color: Colors.medium, padding: 4 },
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
    marginBottom: 4,
  },
  splitRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  splitBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBtnActive: { backgroundColor: Colors.primary },
  splitBtnText: { fontSize: 13, fontWeight: '600', color: Colors.medium },
  splitBtnTextActive: { color: Colors.white },
  splitFields: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  splitFieldsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  splitFieldsTitle: { fontSize: 14, fontWeight: '600', color: Colors.medium },
  remainingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  remainingText: { fontSize: 12, fontWeight: '700' },
  memberField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberFieldName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.dark },
  memberFieldInput: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  smallInput: {
    width: 72,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.dark,
  },
  inputSuffix: { fontSize: 14, fontWeight: '600', color: Colors.medium },
  saveBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  detailModal: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  detailSubtitle: { fontSize: 13, color: Colors.light, marginTop: 2 },
  detailAmountBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  detailAmountLabel: { fontSize: 13, color: Colors.primary, marginBottom: 4 },
  detailAmount: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  detailTax: { fontSize: 13, color: Colors.primary, marginTop: 8 },
  detailSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  participantName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  participantSubLabel: { fontSize: 12, color: Colors.light, marginTop: 1 },
  participantShare: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  detailInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfoLabel: { fontSize: 13, color: Colors.light, marginBottom: 2 },
  detailInfoValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  paidByBox: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  paidByLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light,
    marginBottom: 6,
  },
  paidByName: { fontSize: 16, fontWeight: '600', color: Colors.dark },
});
