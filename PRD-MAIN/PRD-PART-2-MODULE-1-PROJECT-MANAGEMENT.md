# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 2 --- PROJECT MANAGEMENT MODULE

## MODULE 1 --- PROJECT MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Project Management Module merupakan modul utama yang menjadi fondasi
seluruh lifecycle proyek Fiber Optic.

Modul ini berfungsi sebagai master control untuk:

-   Membuat proyek baru.
-   Mengelola informasi utama proyek.
-   Mengatur stakeholder.
-   Mengontrol status lifecycle.
-   Menghubungkan seluruh modul berikutnya.

Seluruh aktivitas:

-   Planning.
-   Survey.
-   DRM.
-   Implementation.
-   CT/UT.
-   Closing.

harus memiliki relasi terhadap Project Master.

------------------------------------------------------------------------

# 2. Project Creation

## 2.1 Objective

Menyediakan mekanisme pembuatan project secara terstruktur.

------------------------------------------------------------------------

## 2.2 Project Input Data

### General Information

  Field                    Description
  ------------------------ --------------------------------------
  Project ID               Unique project identifier
  Project Name             Nama proyek
  Customer                 Client / project owner
  Project Type             Backbone / Metro / FTTx / Enterprise
  Location                 Area pekerjaan
  Contract Number          Nomor kontrak
  Start Date               Tanggal mulai
  Target Completion Date   Target selesai
  Project Manager          PIC utama

------------------------------------------------------------------------

# 3. Project Classification

## 3.1 Project Type

Sistem mendukung klasifikasi:

### Backbone Fiber

Karakteristik:

-   Jarak panjang.
-   Kapasitas core besar.
-   Antar kota / antar POP.

------------------------------------------------------------------------

### Metro Fiber

Karakteristik:

-   Area perkotaan.
-   Banyak node.
-   Dense network.

------------------------------------------------------------------------

### FTTx

Karakteristik:

-   Last mile.
-   Customer access.
-   ODP distribution.

------------------------------------------------------------------------

### Enterprise Fiber

Karakteristik:

-   Dedicated customer.
-   SLA tinggi.
-   Custom design.

------------------------------------------------------------------------

# 4. Project Status Management

## 4.1 Lifecycle Status

Project memiliki status utama:

------------------------------------------------------------------------

## Draft

Project dibuat namun belum aktif.

------------------------------------------------------------------------

## Planning

Aktivitas:

-   BOQ preparation.
-   Initial design.
-   Commercial calculation.

------------------------------------------------------------------------

## Survey

Aktivitas:

-   Field validation.
-   Route verification.
-   Permit identification.

------------------------------------------------------------------------

## DRM

Aktivitas:

-   Design review.
-   Approval.
-   Baseline locking.

------------------------------------------------------------------------

## Implementation

Aktivitas:

-   Construction.
-   Installation.
-   Evidence collection.

------------------------------------------------------------------------

## Commissioning

Aktivitas:

-   Testing.
-   Verification.
-   Acceptance.

------------------------------------------------------------------------

## Closing

Aktivitas:

-   Handover.
-   Documentation.
-   Final report.

------------------------------------------------------------------------

## Completed

Project selesai dan diarsipkan.

------------------------------------------------------------------------

# 5. Project Dashboard

## 5.1 Objective

Memberikan informasi real-time kondisi proyek.

------------------------------------------------------------------------

# 5.2 Dashboard Information

## Project Overview

Menampilkan:

-   Project Name.
-   Customer.
-   Location.
-   Duration.
-   Current Status.
-   Project Manager.

------------------------------------------------------------------------

## Engineering Summary

Menampilkan:

-   Total route length.
-   Fiber capacity.
-   Cable type.
-   Number of segment.

------------------------------------------------------------------------

## Financial Summary

Menampilkan:

-   Contract value.
-   Estimated cost.
-   Actual cost.
-   Profit.
-   Margin percentage.

------------------------------------------------------------------------

## Execution Summary

Menampilkan:

-   Overall progress.
-   Completed segment.
-   Outstanding activity.
-   Issue.

------------------------------------------------------------------------

## Documentation Summary

Menampilkan:

-   Required document.
-   Completed document.
-   Missing document.
-   Approval status.

------------------------------------------------------------------------

# 6. Project Hierarchy

Sistem menggunakan struktur:

PROJECT

↓

WORK PACKAGE

↓

SEGMENT

↓

ACTIVITY

↓

EVIDENCE

Contoh:

Project: Jakarta Fiber Expansion

| 

Segment: Route A-B

| 

Activity: Cable Pulling

| 

Evidence: Photo / Report

------------------------------------------------------------------------

# 7. Project Stakeholder Management

## Objective

Menyimpan seluruh pihak yang terlibat.

------------------------------------------------------------------------

## Internal Stakeholder

Contoh:

-   Project Manager.
-   Engineering.
-   Construction Team.
-   QA/QC.
-   Finance.

------------------------------------------------------------------------

## External Stakeholder

Contoh:

-   Customer.
-   Contractor.
-   Vendor.
-   Government Authority.

------------------------------------------------------------------------

# 8. User Role & Permission

## Project Owner

Permission:

-   View project.
-   Approve milestone.
-   Approve acceptance.

------------------------------------------------------------------------

## Project Manager

Permission:

-   Manage lifecycle.
-   Assign task.
-   Monitor progress.
-   Control issue.

------------------------------------------------------------------------

## Engineering

Permission:

-   Create BOQ.
-   Update design.
-   Manage route.

------------------------------------------------------------------------

## Surveyor

Permission:

-   Input survey.
-   Upload evidence.
-   Update field data.

------------------------------------------------------------------------

## Contractor

Permission:

-   Update construction.
-   Upload evidence.

------------------------------------------------------------------------

## QA/QC

Permission:

-   Verify quality.
-   Approve testing.

------------------------------------------------------------------------

## Finance

Permission:

-   View cost.
-   Manage commercial data.

------------------------------------------------------------------------

# 9. Project Control Principle

## Single Project Repository

Semua informasi proyek tersimpan dalam satu project workspace.

------------------------------------------------------------------------

## Version Control

Setiap perubahan memiliki:

-   Version.
-   User.
-   Timestamp.
-   Reason.

------------------------------------------------------------------------

## Audit Trail

Semua aktivitas tercatat:

-   Who.
-   When.
-   What changed.

------------------------------------------------------------------------

# 10. Module Output

Output dari Project Management Module:

  Output                Used By
  --------------------- -------------
  Project Master Data   Semua modul
  Project Status        Dashboard
  User Assignment       Workflow
  Project Workspace     Dokumentasi
  Lifecycle Control     Governance

------------------------------------------------------------------------

# 11. Success Criteria

Module dianggap berhasil apabila:

-   Project dapat dibuat secara terstruktur.
-   Semua modul memiliki project reference.
-   Stakeholder terdefinisi.
-   Status lifecycle dapat dipantau.
-   Dashboard tersedia.
