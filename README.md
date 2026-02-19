# SplitCoin — React Native App

A full React Native conversion of the SplitCoin web app for iOS and Android.

## Screens Converted

| Web Screen | RN Screen | Notes |
|---|---|---|
| Login | `LoginScreen.tsx` | Email/password + saved accounts |
| Home | `HomeScreen.tsx` | Balance card, group list, filters, FAB |
| Activity | `ActivityScreen.tsx` | Unread/earlier notifications |
| Friends | `FriendsScreen.tsx` | Smart settlement card, friends list |
| Groups | `GroupsScreen.tsx` | Stats, balance overview, groups list |
| GroupDetail | `GroupDetailScreen.tsx` | Expenses, add expense bottom sheet, detail modal |
| CreateGroup | `CreateGroupScreen.tsx` | Group name, member search & selection |
| SettleUp | `SettleUpScreen.tsx` | Smart settlement algorithm, confirm |

## Project Structure

```
SplitCoin_RN/
├── App.tsx                        # Root component
├── package.json
├── src/
│   ├── context/
│   │   └── AppContext.tsx         # Global state (groups, users, expenses)
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Stack + Bottom Tab navigators
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ActivityScreen.tsx
│   │   ├── FriendsScreen.tsx
│   │   ├── GroupsScreen.tsx
│   │   ├── GroupDetailScreen.tsx
│   │   ├── CreateGroupScreen.tsx
│   │   └── SettleUpScreen.tsx
│   └── theme.ts                   # Colors & font weight constants
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- React Native CLI: `npm install -g react-native-cli`
- For iOS: Xcode 14+ and CocoaPods
- For Android: Android Studio with SDK 33+

### Installation

```bash
# 1. Install dependencies
npm install

# 2. iOS only — install pods
cd ios && pod install && cd ..

# 3. Start Metro bundler
npm start

# 4. Run on device/simulator
npm run ios      # iOS
npm run android  # Android
```

## Key Design Decisions

### Navigation
- **Stack Navigator** wraps everything (Login → MainTabs → GroupDetail, CreateGroup, SettleUp)
- **Bottom Tab Navigator** for the 4 main tabs (Activity, Friends, Home, Groups)
- `CreateGroup` uses modal presentation for a native feel
- `SettleUp` and `GroupDetail` use standard card transitions

### State Management
- `AppContext` with `useState` — same pattern as the web app
- No external state library needed for this scope

### Web → Native Mapping

| Web concept | React Native equivalent |
|---|---|
| `div` with `className` | `View` with `StyleSheet` |
| `button` with `onClick` | `TouchableOpacity` with `onPress` |
| `input[type=text]` | `TextInput` |
| CSS `position: fixed` | `position: 'absolute'` |
| Modal/overlay | `Modal` component |
| Bottom sheet | `Modal` with `animationType="slide"` + bottom-anchored `View` |
| `react-router navigate` | `navigation.navigate()` |
| `hover` states | `activeOpacity` on TouchableOpacity |
| Tailwind classes | `StyleSheet.create()` |

### Dependencies Required
```
@react-navigation/native
@react-navigation/stack
@react-navigation/bottom-tabs
react-native-safe-area-context
react-native-screens
react-native-gesture-handler   (peer dep for stack)
```

## Color Palette
All colors are centralized in `src/theme.ts`:
- Primary: `#0D9488` (teal)
- Background: `#F8FAFC`
- Dark text: `#1E293B`
- Accent green: `#16A34A`
- Accent red: `#DC2626`
