# Product Plan

## User Story

As a beginner programmer, I want to practice one coding problem per day with automated tests so I can learn DSA gradually and build a daily habit.

## Core Features

## 1) Problem Practice

- Problem list with filters:
  - Topic: arrays, strings, hash map, sorting, two pointers
  - Difficulty: easy, medium (MVP mostly easy)
- Problem detail view:
  - Statement
  - Constraints
  - Examples
  - Starter code (Python)

## 2) Code Editor and Execution

- Browser editor with syntax highlighting (Python)
- `Run` action:
  - Executes against sample tests only
  - Shows pass/fail per sample
- `Submit` action:
  - Executes against hidden tests + samples
  - Returns verdict (`Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`)

## 3) Daily Challenge and Streak

- One daily problem generated per date
- A day is marked complete when there is >=1 accepted submission on that date
- Calendar heatmap shows active days and current streak
- Optional grace mode excluded in MVP

## 4) Learning Path (No Hints)

Structured progression:

1. Arrays and loops
2. Strings basics
3. Hash map fundamentals
4. Basic sorting
5. Two pointers intro

Each topic should include 5-8 problems in increasing complexity.

## UX Flows

## Flow A: Solve a normal problem

1. Open problem
2. Write code
3. Click `Run` for sample validation
4. Click `Submit`
5. See verdict and failed test details (without exposing hidden expected outputs)

## Flow B: Complete daily challenge

1. Open daily challenge page
2. Solve and submit
3. If accepted, update streak and calendar immediately

## MVP Backlog (Product View)

1. Problem bank seed (30+ beginner problems)
2. Problem list and detail pages
3. Monaco editor integration
4. Run and Submit API flows
5. Verdict and execution report UI
6. Daily challenge assignment
7. Streak calculator and calendar UI
8. Basic progress dashboard by topic
