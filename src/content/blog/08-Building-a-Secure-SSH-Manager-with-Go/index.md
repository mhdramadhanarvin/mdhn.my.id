---
title: "Building a Secure SSH Manager with Go"
description: "A deep dive into creating a CLI tool for managing SSH profiles with encryption and cloud sync"
date: 2026-03-15
tags:
  - go
  - ssh
  - devops
  - security
  - cli
---

## What You'll Learn

This article walks you through building **SSH Manager**, a command-line tool that securely stores your SSH connection profiles with encryption and optionally syncs them to Google Drive. By the end, you'll understand:

- How to implement **AES-256-GCM encryption** with PBKDF2 key derivation
- How to handle both **password and private key authentication** for SSH
- How to integrate **Google Drive OAuth2** for cloud backup
- Why Go is an excellent choice for CLI security tools

> **Prerequisites**: Basic familiarity with Go, understanding of SSH fundamentals, and a Google Cloud project for OAuth2 credentials.

---

## Table of Contents

1. [The Problem: Managing SSH Credentials at Scale](#1-the-problem-managing-ssh-credentials-at-scale)
2. [The Solution: Introducing SSH Manager](#2-the-solution-introducing-ssh-manager)
3. [Architecture Overview](#3-architecture-overview)
   - [Core Security Model](#core-security-model)
   - [Data Storage](#data-storage)
   - [Google Drive Sync](#google-drive-sync)
4. [Usage Guide](#4-usage-guide)
   - [Adding a Profile](#adding-a-profile)
   - [Connecting to a Server](#connecting-to-a-server)
   - [Managing Profiles](#managing-profiles)
   - [Cloud Sync](#cloud-sync)
5. [Key Implementation Details](#5-key-implementation-details)
   - [Private Key Handling](#private-key-handling)
   - [Auto-Sync](#auto-sync)
6. [Why Go?](#6-why-go)
7. [What's Next?](#7-whats-next)
8. [Conclusion](#8-conclusion)

---

## 1. The Problem: Managing SSH Credentials at Scale

If you're like most DevOps engineers or system administrators, you probably have:

- Multiple development servers
- Staging and production environments
- Various cloud instances across different providers
- Different authentication methods (keys, passwords)

Juggling `~/.ssh/config` files or keeping notes in password managers isn't ideal. You need something that is:

- **Secure** - credentials shouldn't be stored in plain text
- **Portable** - accessible across your machines
- **Fast** - quick connections without hassle

---

## 2. The Solution: Introducing SSH Manager

I built a Go-based CLI tool that stores SSH profiles securely and optionally syncs them to Google Drive. Here's what makes it special:

- **Military-grade encryption** using AES-256-GCM with PBKDF2 key derivation
- **Dual authentication** - supports both passwords and private keys
- **Cloud sync** - backup and restore profiles from Google Drive
- **Zero dependencies** - runs anywhere Go compiles

---

## 3. Architecture Overview

### Core Security Model

The most critical part of any credential manager is security. Here's how encryption works in SSH Manager:

```go
func (s *SecureStorage) Encrypt(password string) error {
    // Generate random salt for each encryption
    salt := make([]byte, saltLen)
    if _, err := rand.Read(salt); err != nil {
        return fmt.Errorf("failed to generate salt: %v", err)
    }
    s.Salt = salt

    // Derive key using PBKDF2 (10,000 iterations)
    key := pbkdf2.Key([]byte(password), salt, iterCount, cipherKeyLen, sha256.New)
    block, err := aes.NewCipher(key)
    // ... GCM mode encryption
}
```

Key security features:

- **PBKDF2** with 10,000 iterations prevents brute-force attacks
- **Unique salt** per encryption ensures identical passwords produce different ciphertexts
- **AES-256-GCM** provides both confidentiality and integrity

### Data Storage

All data is stored in `~/.sshmanager/`:

```
~/.sshmanager/
├── profiles.enc   # Encrypted SSH profiles
├── settings.json  # App settings (auto-sync)
└── token.json     # Google OAuth token
```

### Google Drive Sync

The optional cloud sync uses OAuth2 with the following flow:

1. Authenticate using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
2. Token is cached locally for subsequent operations
3. Profiles are uploaded/downloaded as `sshmanager_profiles.enc`

---

## 4. Usage Guide

### Adding a Profile

```bash
sshmanager add
```

You'll be prompted for:

- Profile name (e.g., "production-web-01")
- Host address
- Port (default: 22)
- Username
- Password or private key path

### Connecting to a Server

```bash
sshmanager connect production-web-01
```

The tool handles authentication automatically:

- **Private keys** are decoded, written to a temp file with `0600` permissions, used for SSH, then securely deleted
- **Passwords** use `sshpass` with `PubkeyAuthentication=no`

### Managing Profiles

```bash
# List all profiles
sshmanager list

# Edit a profile
sshmanager edit production-web-01

# Delete a profile
sshmanager delete production-web-01
```

### Cloud Sync

```bash
# Enable auto-sync
sshmanager setting

# Manual sync
sshmanager sync
```

---

## 5. Key Implementation Details

### Private Key Handling

One of the trickiest parts was handling private keys securely:

```go
tempFile, err := os.CreateTemp("", "sshmanager_key_*.pem")
defer os.Remove(tempFile.Name())  // Always clean up
defer tempFile.Close()

if profile.PrivateKeyContent != "" {
    keyBytes, err := base64.StdEncoding.DecodeString(profile.PrivateKeyContent)
    tempFile.Write(keyBytes)
    os.Chmod(tempFile.Name(), 0600)  // Secure permissions
}
```

The key is written to a temporary file with restrictive permissions, used for the SSH connection, and immediately deleted when the connection closes.

### Auto-Sync

Every profile modification automatically triggers a sync if auto-sync is enabled:

```go
func addProfile(dir string) {
    // ... add profile logic
    if err := saveProfiles(dir, s); err != nil {
        log.Fatal(err)
    }

    settings, _ := loadSettings()
    syncDrive(settings.AutoSync)  // Auto-sync after changes
}
```

---

## 6. Why Go?

I chose Go for this project because:

1. **Cross-platform** - compiles to any platform
2. **Standard library** - minimal external dependencies
3. **Performance** - fast startup, low memory footprint
4. **Crypto packages** - excellent `crypto` and `golang.org/x/crypto` support

---

## 7. What's Next?

Future improvements I'm considering:

- **SSH config export** - generate `~/.ssh/config` entries
- **Multiple cloud providers** - support AWS S3, Dropbox
- **TOTP support** - for servers with 2FA
- **SSH agent integration** - leverage existing ssh-agent

---

## 8. Conclusion

SSH Manager has become an essential part of my daily workflow. It keeps my credentials encrypted, accessible across machines, and most importantly - I only need to remember one master password.

The complete source code is available in my repository. Feel free to fork it, contribute, or suggest improvements!

---

_Do you use a similar tool? What's your approach to managing SSH credentials? Let me know in the comments!_
