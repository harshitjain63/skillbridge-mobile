<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
SkillBridge Mobile App
</h1>

> Built using Obytes Starter (Expo + React Native)

---

## 🚀 Features Implemented

### 🔐 Authentication

* Login & Register flow
* Basic auth handling
* Profile picture upload

---

### 📚 Course Feed

* API integration using React Query
* Search functionality
* Pull-to-refresh
* Optimized list using FlashList
* Loading, empty & error states
* Bookmark toggle

---

### 📄 Course Detail

* Course information (title, instructor, description, etc.)
* Image display (fixed for React Native)
* Bookmark toggle
* Enroll button with success feedback

---

### 🔖 Bookmark System

* Zustand for state management
* Persistent storage using MMKV
* Bookmark listing screen
* Auto hydration on app load

---

### 🌐 WebView Integration

* Route: `/feed/[id]/content`
* Injected course data from native → WebView
* Interactive HTML UI inside WebView
* WebView → Native communication via `postMessage`

---

### 🔔 Notifications

* Triggered when user bookmarks 5 courses
* Permission handling implemented
* Immediate notification scheduling

---

## 🧱 Tech Stack

* React Native (Expo)
* Expo Router
* NativeWind (Tailwind CSS)
* React Query
* Zustand + MMKV
* React Native WebView
* Expo Notifications

---

## 👋 Quick start

Clone the repo and install dependencies:

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

Run on iOS:

```sh
pnpm ios
```

Run on Android:

```sh
pnpm android
```

---

## ⚠️ Known Limitations

* The Images coming from the free api is not visible in the react native , i dont know the exact issue
* UI can be further polished

---

## ✍️ Documentation

* [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
* [Project structure](https://starter.obytes.com/getting-started/project-structure)
* [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
* [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
* [Components](https://starter.obytes.com/ui-and-theme/components)
* [Forms](https://starter.obytes.com/ui-and-theme/Forms)
* [Data fetching](https://starter.obytes.com/guides/data-fetching)
