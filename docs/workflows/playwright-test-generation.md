---
description: How to generate Playwright tests for complex processes like Kanban workflows
---

# Workflow Test Generation Prompt

To get the absolute best results from any AI (whether it's Copilot, Antigravity, or Claude) when generating Playwright tests for complex processes like your Kanban board, use the template prompt below. It forces the AI to think in State Transitions rather than just button clicks.

Copy and paste this template whenever you build a new multi-step process in SwastikCore:

```markdown
System Role: You are a Senior SDET (Software Development Engineer in Test) specializing in Node.js, React, and Playwright.

Task: Generate a complete, robust Playwright E2E test script (.spec.js) for a new workflow in our laboratory system.

Context: Our system uses a React frontend and a Node.js/SQLite backend. We rely heavily on data-cy attributes for test targeting. All tests must authenticate as an admin before running.

Workflow Details:

Workflow Name: [Insert Workflow Name, e.g., Wholesale Silver Testing]

Starting State: [e.g., A customer record exists, and a new test is dropped into the TODO Kanban column]

The Steps: [List the exact 3-4 steps the user takes, e.g., 1. Click card, 2. Enter 15.5g weight, 3. Select 'Refining' loss, 4. Click Complete]

Expected End State: [e.g., The card moves to DONE, a success Toast appears, and the thermal print button is visible]

Requirements for the Code:

Authentication: Include a test.beforeEach hook that logs in using admin / admin123 and navigates to the starting URL.

Resilience: Use Playwright's locator().waitFor() and .toBeVisible() assertions before interacting with dynamic modals or Kanban cards.

Edge Cases: Generate one "Happy Path" test, and at least one "Negative/Failure" test (e.g., what happens if the user leaves a required field blank or violates a mathematical rule?).

Comments: Add clear, numbered inline comments matching "The Steps" provided above.
```
