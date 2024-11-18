---
title: "CI/CD for Laravel Using FTP in GitHub Actions"
summary: "This guide outlines setting up a CI/CD pipeline for Laravel using GitHub Actions, automating testing and FTP-based deployment. By running tests on each push and deploying only when tests pass, this setup enhances efficiency and reliability for Laravel projects."
date: "Mar 12 2024"
draft: false
tags:
  - Tutorial
  - Laravel
  - CI/CD
---

## Table of Contents

1.  [Introduction](#introduction)
2.  [Prerequisites](#prerequisites)
3.  [Setting Up](#setting-up)
    1. [Setup ENV File](#setup-env-file)
    2. [Configuring GitHub Actions for CI/CD](#configuring-github-actions-for-cicd)
    3. [Running Tests with GitHub Actions](#running-tests-with-github-actions)
4.  [Best Practices](#best-practices)
5.  [Conclusion](#conclusion)

## Introduction

Automating testing and deployment processes is essential in today’s development workflows. With GitHub Actions, it’s easier than ever to create workflows that build, test, and deploy applications automatically. In this tutorial, we’ll create a CI/CD pipeline that tests our Laravel application and deploys it using FTP.

The goals this session we want every create Pull Request (PR) will trigger workflows with actions run test to ensure our app ready for deploy to production. And when the PR is merged or have changes at `main` branch its will automatically deploy our app to server.
This will be speed up your development process.

## Prerequisites

Before we start, make sure you have:

1. A Laravel project on GitHub
2. FTP credentials (hostname, username, password) for your server (VPS or Shared Hosting), store this variable in your Github secrets at page **Settings > Secrets and Variables > Actions** :
   1. **FTP_SERVER** fill with IP or Hostname of your FTP Server.
   2. **FTP_USERNAME** fill with username of FTP Account.
   3. **FTP_PASSWORD** fill with password of FTP Account.
   4. **SSH_HOST** fill with host for ssh to server.
   5. **SSH_USERNAME** fill with username for ssh to server.
   6. **SSH_PASSWORD** fill with password for ssh to server.
   7. **SSH_PORT** fill with port for ssh to server, default is 22.
   8. **CRENDENTIALS_PASSPHRASE** fill with passphrase to encrypt and decrypt env file.
3. Basic understanding of GitHub Actions and Laravel testing

## Setting Up

Before start we must be setup our laravel project.

### Setup ENV File

At first we must be prepare **.env** file for production environment. Run this command at your terminal.

```bash
cp .env.example .env.production # adjust file .env.production to works on production
gpg --symmetric --cipher-algo AES256 .env.production # don't forget the passphrase after run this command
```

The next we need a bash file to decrypt **.env.production.gpg** at Github Actions. Create a file in root directory with name **decrypt_env.sh**.

```sh
#!/bin/sh
gpg --quiet --batch --yes --decrypt --passphrase="$LARGE_SECRET_PASSPHRASE" \
--output ./.env ./.env.gpg
```

#### Explanation

1. At line `cp .env.example ...` it will be copy file .env.example to file .env.production, you can be adjust the file to production use
2. At line `gpg --symmetric ...` it will be generate encrypted file with name **.env.production.gpg**, the encrypted file can be decrypt with passphrase enter at prompted when run this command, this file will be decrypt and copying to your server in next step.

#### Notes

The **.env.production** file is convidential never save it in the Github repository, you can register it in the **.gitignore** file.

### Configuring GitHub Actions for CI/CD

After preparing ENV file the next step we will setup workflow for deploy our application to server using FTP. Create a file **deploy.yml** at directory **.github/workflows/deploy.yml**.

```yml
name: Deploy Laravel App

on:
  push:
    branches:
      - main

jobs:
  tests:
    name: Deploy Process
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "8.3"
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite, bcmath, soap, intl, gd, exif, iconv, redis
          tools: composer:v2
          coverage: none

      - name: Run composer install
        run: composer install -n --prefer-dist -o

      - name: Decrypt large env
        run: cp .env.production.gpg .env.gpg && ./decrypt_env.sh
        env:
          LARGE_SECRET_PASSPHRASE: ${{ secrets.CRENDENTIALS_PASSPHRASE }}

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20.x"
      - name: Install dependencies
        run: npm ci

      - name: Build App
        run: |
          npm run build && \
          rm -rf ./public/.htaccess

      - uses: montudor/action-zip@v1
        with:
          args: zip -qq -r deploy/app.zip ./ -x ".git/*"

      - uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ${{ secrets.PROTOCOL_FTP }}
          local-dir: ./deploy/
          log-level: verbose
          timeout: 60000

      - name: executing remote ssh commands using password
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          password: ${{ secrets.SSH_PASSWORD }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd /home/${{ secrets.SSH_USERNAME }}/laravel
            rm -rf public/build
            unzip -o app.zip -d /home/${{ secrets.SSH_USERNAME }}/laravel/
            rm -rf app.zip
            php artisan optimize
```

#### Explanation

1. **on:** : is meaning this Github Actions will be triggered when has changed at branch main.
2. **name: Setup PHP** : the Github Actions will installed php with version **8.3** including installed php extensions defined.
3. **name: Run composer install** : the Github Actions will be run **composer install ...**.
4. **name: Decrypt large env** : will be decrypt **.env.production.gpg** file to be file **.env**.
5. **name: Build App** : we will build app UI and Frontend, this very useful if our app use Tailwind or React JS as Frontend.
6. **uses: montudor/action-zip@v1** : all of our app will be archive to zip to simplify and faster deployment to server.
7. **uses: SamKirkland/FTP-Deploy-Action@v4.3.4** : the zip file will deploy to server using FTP protocol.
8. **name: executing remote ssh commands using password** : we need do something like unzip the archive zip file and run php artisan command like optimize laravel app using SSH.

#### Notes

We can add another command in script at block `name: executing remote ssh commands using password` like run `php artisan migrate` or anything else.

### Running Tests with GitHub Actions

We need workflows to run laravel tests, this workflow helps us to make sure our application is healthy and ready to be deploy to production. Create a file **test.yml** at directory **.github/workflows/test.yml**.

```yml
name: Test on Pull Request

on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "8.3"
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite, bcmath, soap, intl, gd, exif, iconv, redis
          tools: composer:v2
          coverage: none

      - name: Install dependencies
        run: composer install --prefer-dist --no-interaction

      - name: Set up environment
        run: cp .env.example .env

      - name: Generate application key
        run: php artisan key:generate

      - name: Run tests
        run: php artisan test
```

## Best Practices

To ensure an efficient and maintainable CI/CD pipeline, start by separating workflows for testing and deployment. Use a dedicated workflow for testing on pull request events to catch issues early, and another for deploying only tested code when changes are merged into the main branch. Modular workflows help avoid unnecessary coupling and keep processes streamlined. Additionally, make use of GitHub Secrets to securely store sensitive information like FTP credentials and API tokens, preventing them from being hardcoded in your configuration.

Optimize workflows by leveraging caching to reduce build times, such as caching Composer dependencies. Keep workflows lean by minimizing redundancy and using centralized scripts or reusable workflows. Testing in parallel, such as with matrix builds for multiple PHP versions, can further improve efficiency. Enforcing branch protection rules ensures that only thoroughly tested code is merged, maintaining high code quality standards.

Deployments should include a rollback plan for failed changes, such as keeping backups of previous releases or using version control for quick recovery. Notifications for workflow results, whether via Slack or email, keep teams informed about the status of deployments. Additionally, automating infrastructure management with tools like Terraform or Pulumi can enhance scalability and simplify deployments. Finally, document your workflows clearly to ensure team members can easily understand and contribute to maintaining or improving the pipeline.

## Conclusion

A well-designed CI/CD pipeline improves efficiency, reliability, and maintainability in software development. By separating workflows for testing and deployment, securing sensitive data with GitHub Secrets, and optimizing performance through caching and parallel testing, you can streamline processes and ensure high-quality code. Incorporating rollback plans, notifications, and infrastructure-as-code tools like Terraform further strengthen the deployment strategy. Clear documentation and implementation of branch protection rules help maintain a collaborative and robust pipeline that supports consistent and secure application delivery.
