# PCFMS Mobile App Context

## Project

Poultry Contract Farming Management System (PCFMS)

This repository contains the React Native mobile application.

The app will be used by:

* Super Admin
* Company Admin
* Supervisor
* Farm Owner

The application must support Android and iOS from a single codebase.

---

# Technology Stack

## Core

* React Native
* TypeScript

## Navigation

* React Navigation v7

## State Management

* Zustand

## Server State

* TanStack Query

## Forms

* React Hook Form
* Zod Validation

## Networking

* Axios

## UI

* Material Design
* React Native Paper

## Storage

* React Native Keychain
* AsyncStorage (non-sensitive data)

---

# Architecture Principles

* Feature Based Architecture
* Scalable Folder Structure
* Mobile First
* Offline Friendly
* Reusable Components
* Strong Type Safety

---

# Folder Structure

src/

* app/
* navigation/
* features/
* services/
* hooks/
* store/
* theme/
* components/
* utils/
* constants/
* types/

---

# Feature Structure

Each feature should contain:

features/

auth/

* screens/
* components/
* hooks/
* services/
* store/
* types/

users/

* screens/
* components/
* hooks/
* services/
* types/

---

# Authentication

The backend uses:

* JWT Access Token
* Refresh Token

Requirements:

* Auto Login
* Auto Logout
* Refresh Token Rotation
* Secure Token Storage
* Session Restoration

Access Token:

* 15 minutes

Refresh Token:

* 30 days

Store tokens using Keychain.

Never store sensitive tokens in AsyncStorage.

---

# Phase 1 Scope

Implement only:

## Authentication

* Splash Screen
* Login Screen
* Logout
* Session Restore

## Authorization

* Role Based Navigation
* Protected Routes

## User Management

* User List
* User Details
* Create User
* Edit User

---

# API Communication

Backend:

NestJS REST API

Requirements:

* Axios Client
* Request Interceptors
* Response Interceptors
* Automatic Token Refresh
* Global Error Handling

---

# Navigation Structure

Splash

↓

Authentication Stack

* Login

↓

Application Stack

* Dashboard
* Users
* User Details
* Create User
* Edit User

---

# UI Standards

Use Material Design principles.

Requirements:

* Responsive Layout
* Dark Mode Ready
* Reusable Components
* Consistent Spacing
* Accessibility Support

---

# Coding Standards

* Strict TypeScript
* Functional Components Only
* Custom Hooks
* No Business Logic Inside Screens
* Reusable Service Layer

---

# Claude Code Instructions

Before generating code:

1. Explain architecture decisions.
2. Explain folder placement.
3. Generate production-ready code.
4. Avoid placeholder code.
5. Follow existing project conventions.
6. Keep scalability in mind for future modules.
