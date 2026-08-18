# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 9 --- CROSS FUNCTIONAL SYSTEM

## MODULE 12 --- APPROVAL WORKFLOW ENGINE

## MODULE 13 --- AUDIT TRAIL MANAGEMENT

## MODULE 14 --- SECURITY MANAGEMENT

------------------------------------------------------------------------

# MODULE 12 --- APPROVAL WORKFLOW ENGINE

# 1. Module Overview

## 1.1 Objective

Approval Workflow Engine digunakan untuk memastikan seluruh keputusan
penting dalam lifecycle proyek memiliki proses approval yang
terstruktur, terdokumentasi, dan dapat diaudit.

Objek approval:

-   BOQ.
-   Survey Result.
-   DRM.
-   Change Request.
-   Evidence.
-   CT Result.
-   Closing Document.

------------------------------------------------------------------------

# 2. Approval Workflow Principle

Setiap approval memiliki:

-   Requestor.
-   Reviewer.
-   Approver.
-   Timestamp.
-   Decision.
-   Comment.
-   Version.

------------------------------------------------------------------------

# 3. Approval Flow Example

## BOQ Approval

``` text
Engineering

↓

Project Manager

↓

Commercial Review

↓

Customer Approval

↓

Approved
```

------------------------------------------------------------------------

# 4. Approval Status

Status:

## Draft

Dokumen dibuat namun belum diajukan.

## Submitted

Menunggu review.

## Under Review

Sedang dilakukan pemeriksaan.

## Approved

Disetujui.

## Rejected

Ditolak.

## Revision Required

Perlu revisi.

------------------------------------------------------------------------

# 5. Approval History

System menyimpan:

  Field
  ----------
  User
  Date
  Decision
  Comment
  Version

------------------------------------------------------------------------

# 6. Approval Rule Management

Business rule dapat dikonfigurasi:

Contoh:

BOQ dengan nilai tertentu membutuhkan approval tambahan Finance.

Change Request dengan impact margin tinggi membutuhkan approval
Management.

------------------------------------------------------------------------

# MODULE 13 --- AUDIT TRAIL MANAGEMENT

# 7. Module Overview

## 7.1 Objective

Audit Trail memastikan seluruh perubahan data dapat ditelusuri.

Tujuan:

-   Governance.
-   Compliance.
-   Investigation.
-   Accountability.

------------------------------------------------------------------------

# 8. Audit Data Recording

Setiap perubahan mencatat:

  Field
  -----------
  Audit ID
  User
  Module
  Action
  Old Value
  New Value
  Timestamp
  Reason

------------------------------------------------------------------------

# 9. Audit Example

Before:

``` text
Cable Length:

10 KM
```

After:

``` text
Cable Length:

12 KM
```

Reason:

Survey adjustment.

------------------------------------------------------------------------

# 10. Audit Coverage

Audit mencakup:

-   BOQ change.
-   Route change.
-   Cost change.
-   Margin change.
-   Approval action.
-   Document update.

------------------------------------------------------------------------

# MODULE 14 --- SECURITY MANAGEMENT

# 11. Module Overview

## 11.1 Objective

Security Management memastikan data proyek aman dan hanya dapat diakses
oleh user yang memiliki hak akses.

------------------------------------------------------------------------

# 12. Authentication

Support:

-   Username/password.
-   Single Sign On (SSO).
-   OAuth.

------------------------------------------------------------------------

# 13. Authorization

Menggunakan:

Role Based Access Control (RBAC).

------------------------------------------------------------------------

# 14. Role Permission Example

## Project Owner

Access:

-   View project.
-   Approve milestone.
-   View financial summary.

------------------------------------------------------------------------

## Engineering

Access:

-   Manage BOQ.
-   Manage design.
-   Manage route.

------------------------------------------------------------------------

## Contractor

Access:

-   Update progress.
-   Upload evidence.

------------------------------------------------------------------------

## Finance

Access:

-   View cost.
-   Manage commercial data.

------------------------------------------------------------------------

# 15. Data Security Requirement

Sistem mendukung:

-   Encryption.
-   Backup.
-   Access logging.
-   File permission.
-   Session management.

------------------------------------------------------------------------

# 16. File Security

Dokumen:

-   BOQ.
-   KML.
-   Evidence.
-   Test Result.

harus memiliki:

-   Access control.
-   Download permission.
-   Version control.

------------------------------------------------------------------------

# 17. Success Criteria

Module berhasil apabila:

-   Approval terdokumentasi.
-   Semua perubahan dapat diaudit.
-   Hak akses sesuai role.
-   Data proyek terlindungi.
