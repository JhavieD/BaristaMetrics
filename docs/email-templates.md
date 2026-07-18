# Email Notification Templates

## Staff Invitation Email
**Trigger:** Admin invites staff via `/admin/users`
**Subject:** You're invited to join BaristaMetrics
**Body:**
```
Hi,

You've been invited to join BaristaMetrics - the inventory management system for Big Brew.

Click the link below to set up your account:
[INVITATION_LINK]

This link expires in 7 days.

If you have questions, contact your branch admin.
```

## Password Reset Email
**Trigger:** User requests password reset
**Subject:** Reset your BaristaMetrics password
**Body:**
```
Hi,

You requested a password reset for your BaristaMetrics account.

Click the link below to set a new password:
[RESET_LINK]

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.
```

## Low Stock Alert (Admin Only)
**Trigger:** Expected remaining stock falls below 20% of starting stock
**Subject:** Low stock alert: [Item Name] - [Branch]
**Body:**
```
Low stock alert for [Item Name] at [Branch].

Current stock: [X] [unit]
Starting stock: [Y] [unit]
Threshold: 20%

Please review and place a restock order if needed.
```

## Weekly Summary (Admin Only)
**Trigger:** Every Monday at 8:00 AM
**Subject:** BaristaMetrics Weekly Report - [Date Range]
**Body:**
```
Weekly Inventory Report

Branch: [Branch Name]
Period: [Start Date] - [End Date]

Summary:
- Total deductions: [X]
- Total deliveries: [Y]
- Items tracked: [Z]

Top consumed items:
1. [Item] - [Quantity] used
2. [Item] - [Quantity] used
3. [Item] - [Quantity] used

Items with variance (expected vs actual):
- [Item]: [Variance] ([Percent]%)
```

## Security Alert (Admin Only)
**Trigger:** 5 failed logins in 10 minutes, or deduction > 50% of stock
**Subject:** Security alert: Unusual activity detected
**Body:**
```
Security alert for BaristaMetrics.

Type: [Failed login / Large deduction / Off-hours activity]
Time: [Timestamp]
User: [Email]
Details: [Description]

Please review the audit log for more information.
```

## Transfer Confirmation
**Trigger:** Successful cross-branch transfer
**Subject:** Stock transfer completed: [Source] → [Destination]
**Body:**
```
Stock transfer completed.

Item: [Item Name]
Quantity: [Quantity] [Unit]
From: [Source Branch]
To: [Destination Branch]
Initiated by: [Admin Email]
Time: [Timestamp]

Both branches' inventory has been updated.
```
