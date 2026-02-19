import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface PercentageSplit {
  memberId: string;
  percentage: number;
}

export interface UnequalSplit {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'unequal';
  percentageSplits?: PercentageSplit[];
  unequalSplits?: UnequalSplit[];
  tax?: number;
}

export interface Group {
  id: string;
  name: string;
  totalSpend: number;
  balance: number;
  lastActivity: string;
  expenses: Expense[];
  members: Member[];
  category: string;
  status: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
}

interface AppContextType {
  isLoggedIn: boolean;
  rememberMe: boolean;
  user: Member;
  groups: Group[];
  savedAccounts: SavedAccount[];
  login: (email: string, password: string, remember: boolean) => void;
  loginWithSaved: (accountId: string) => void;
  logout: () => void;
  addExpense: (groupId: string, expense: Omit<Expense, 'id'>) => void;
  updateExpense: (groupId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (groupId: string, expenseId: string) => void;
  addGroup: (name: string, members: Member[], category?: string) => void;
  getGroup: (groupId: string) => Group | undefined;
  updateMember: (groupId: string, memberId: string, updates: Partial<Member>) => void;
  removeMember: (groupId: string, memberId: string) => void;
  getMemberBalance: (groupId: string, memberId: string) => number;
  calculateSettlement: (groupId: string) => Settlement[];
  settleGroup: (groupId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const availableFriends: Member[] = [
  { id: 'arjun', name: 'Arjun', email: 'arjun@example.com' },
  { id: 'sneha', name: 'Sneha', email: 'sneha@example.com' },
  { id: 'rohan', name: 'Rohan', email: 'rohan@example.com' },
];

const betaUser: Member = { id: 'beta', name: 'Beta', email: 'beta@example.com' };

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Weekend Trip',
    totalSpend: 12400,
    balance: 2400,
    lastActivity: '2 hours ago',
    members: [betaUser, availableFriends[0], availableFriends[1]],
    expenses: [
      {
        id: 'e1',
        description: 'Hotel Booking',
        amount: 8000,
        date: '2026-02-16',
        paidBy: 'beta',
        splitType: 'equal',
      },
      {
        id: 'e2',
        description: 'Dinner at Restaurant',
        amount: 2400,
        date: '2026-02-17',
        paidBy: 'arjun',
        splitType: 'equal',
        tax: 240,
      },
    ],
    category: 'trip',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Apartment Rent',
    totalSpend: 36000,
    balance: -12000,
    lastActivity: 'Yesterday',
    members: [betaUser, availableFriends[2]],
    expenses: [
      {
        id: 'e4',
        description: 'February Rent',
        amount: 36000,
        date: '2026-02-01',
        paidBy: 'rohan',
        splitType: 'equal',
      },
    ],
    category: 'home',
    status: 'Active',
  },
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Weekend Trip',
    totalSpend: 12400,
    balance: 2400,
    lastActivity: '2 hours ago',
    members: [betaUser, availableFriends[0], availableFriends[1]],
    expenses: [
      { id: 'e1', description: 'Hotel Booking', amount: 8000, date: '2026-02-16', paidBy: 'beta', splitType: 'equal' },
      { id: 'e2', description: 'Dinner at Restaurant', amount: 2400, date: '2026-02-17', paidBy: 'arjun', splitType: 'equal', tax: 240 },
      { id: 'e3', description: 'Taxi Rides', amount: 2000, date: '2026-02-18', paidBy: 'beta', splitType: 'equal' },
    ],
    category: 'Travel',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Apartment Rent',
    totalSpend: 36000,
    balance: -12000,
    lastActivity: 'Yesterday',
    members: [betaUser, availableFriends[2]],
    expenses: [
      { id: 'e4', description: 'February Rent', amount: 36000, date: '2026-02-01', paidBy: 'rohan', splitType: 'equal' },
    ],
    category: 'Rent',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Smart Settlement Demo',
    totalSpend: 1800,
    balance: 600,
    lastActivity: '5 mins ago',
    members: [betaUser, availableFriends[0], availableFriends[1], availableFriends[2]],
    expenses: [
      { id: 'e7', description: 'Dinner', amount: 1200, date: '2026-02-18', paidBy: 'beta', splitType: 'equal' },
      {
        id: 'e8',
        description: 'Snacks',
        amount: 600,
        date: '2026-02-18',
        paidBy: 'arjun',
        splitType: 'percentage',
        percentageSplits: [
          { memberId: 'beta', percentage: 50 },
          { memberId: 'arjun', percentage: 50 },
          { memberId: 'sneha', percentage: 0 },
          { memberId: 'rohan', percentage: 0 },
        ],
      },
    ],
    category: 'Food',
    status: 'Active',
  },
];

const mockSavedAccounts: SavedAccount[] = [
  { id: 'beta', name: 'Beta', email: 'beta@example.com' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [user, setUser] = useState<Member>(betaUser);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [savedAccounts] = useState<SavedAccount[]>(mockSavedAccounts);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getMemberBalanceForGroup = (group: Group, memberId: string): number => {
    let balance = 0;
    group.expenses.forEach(expense => {
      if (expense.splitType === 'equal') {
        const share = expense.amount / group.members.length;
        balance += expense.paidBy === memberId ? expense.amount - share : -share;
      } else if (expense.splitType === 'percentage' && expense.percentageSplits) {
        const split = expense.percentageSplits.find(s => s.memberId === memberId);
        const share = split ? (expense.amount * split.percentage) / 100 : 0;
        balance += expense.paidBy === memberId ? expense.amount - share : -share;
      } else if (expense.splitType === 'unequal' && expense.unequalSplits) {
        const split = expense.unequalSplits.find(s => s.memberId === memberId);
        const share = split ? split.amount : 0;
        balance += expense.paidBy === memberId ? expense.amount - share : -share;
      }
    });
    return Math.round(balance);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = (email: string, password: string, remember: boolean) => {
    setIsLoggedIn(true);
    setRememberMe(remember);
  };

  const loginWithSaved = (accountId: string) => {
    const account = savedAccounts.find(a => a.id === accountId);
    if (account) {
      setUser({ id: account.id, name: account.name, email: account.email });
      setIsLoggedIn(true);
      setRememberMe(true);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // ── Expenses ──────────────────────────────────────────────────────────────

  const addExpense = (groupId: string, expense: Omit<Expense, 'id'>) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        const updated = [...g.expenses, { ...expense, id: `e${Date.now()}` }];
        return {
          ...g,
          expenses: updated,
          totalSpend: updated.reduce((s, e) => s + e.amount, 0),
          balance: getMemberBalanceForGroup({ ...g, expenses: updated }, user.id),
          lastActivity: 'Just now',
        };
      }),
    );
  };

  const updateExpense = (groupId: string, expenseId: string, updates: Partial<Expense>) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        const updated = g.expenses.map(e => (e.id === expenseId ? { ...e, ...updates } : e));
        return {
          ...g,
          expenses: updated,
          totalSpend: updated.reduce((s, e) => s + e.amount, 0),
          balance: getMemberBalanceForGroup({ ...g, expenses: updated }, user.id),
          lastActivity: 'Just now',
        };
      }),
    );
  };

  const deleteExpense = (groupId: string, expenseId: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        const updated = g.expenses.filter(e => e.id !== expenseId);
        return {
          ...g,
          expenses: updated,
          totalSpend: updated.reduce((s, e) => s + e.amount, 0),
          balance: getMemberBalanceForGroup({ ...g, expenses: updated }, user.id),
          lastActivity: 'Just now',
        };
      }),
    );
  };

  // ── Groups ────────────────────────────────────────────────────────────────

  const addGroup = (name: string, members: Member[], category = 'Other') => {
    setGroups(prev => [
      ...prev,
      {
        id: `g${Date.now()}`,
        name,
        totalSpend: 0,
        balance: 0,
        lastActivity: 'Just now',
        expenses: [],
        members: [user, ...members],
        category,
        status: 'Active',
      },
    ]);
  };

  const getGroup = (groupId: string) => groups.find(g => g.id === groupId);

  // ── Members ───────────────────────────────────────────────────────────────

  const updateMember = (groupId: string, memberId: string, updates: Partial<Member>) => {
    setGroups(prev =>
      prev.map(g =>
        g.id !== groupId
          ? g
          : {
              ...g,
              members: g.members.map(m => (m.id === memberId ? { ...m, ...updates } : m)),
            },
      ),
    );
  };

  const removeMember = (groupId: string, memberId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id !== groupId
          ? g
          : { ...g, members: g.members.filter(m => m.id !== memberId) },
      ),
    );
  };

  const getMemberBalance = (groupId: string, memberId: string): number => {
    const group = getGroup(groupId);
    if (!group) return 0;
    return getMemberBalanceForGroup(group, memberId);
  };

  // ── Settlement ────────────────────────────────────────────────────────────

  const calculateSettlement = (groupId: string): Settlement[] => {
    const group = getGroup(groupId);
    if (!group) return [];

    const creditors = group.members
      .map(m => ({ id: m.id, balance: getMemberBalance(groupId, m.id) }))
      .filter(m => m.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const debtors = group.members
      .map(m => ({ id: m.id, balance: Math.abs(getMemberBalance(groupId, m.id)) }))
      .filter(m => getMemberBalance(groupId, m.id) < 0)
      .sort((a, b) => b.balance - a.balance);

    const settlements: Settlement[] = [];
    let i = 0;
    let j = 0;
    while (i < creditors.length && j < debtors.length) {
      const amount = Math.min(creditors[i].balance, debtors[j].balance);
      if (amount > 0) {
        settlements.push({ from: debtors[j].id, to: creditors[i].id, amount });
      }
      creditors[i].balance -= amount;
      debtors[j].balance -= amount;
      if (creditors[i].balance === 0) i++;
      if (debtors[j].balance === 0) j++;
    }
    return settlements;
  };

  const settleGroup = (groupId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, expenses: [], totalSpend: 0, balance: 0, lastActivity: 'Just now' }
          : g,
      ),
    );
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        rememberMe,
        user,
        groups,
        savedAccounts,
        login,
        loginWithSaved,
        logout,
        addExpense,
        updateExpense,
        deleteExpense,
        addGroup,
        getGroup,
        updateMember,
        removeMember,
        getMemberBalance,
        calculateSettlement,
        settleGroup,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
