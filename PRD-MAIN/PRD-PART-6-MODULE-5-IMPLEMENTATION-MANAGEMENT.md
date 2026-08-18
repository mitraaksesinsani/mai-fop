# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 6 --- IMPLEMENTATION MANAGEMENT MODULE

## MODULE 5 --- IMPLEMENTATION / CONSTRUCTION MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Implementation Management Module merupakan tahap eksekusi pembangunan
Fiber Optic berdasarkan hasil final dari Design Review Meeting (DRM).

Modul ini menggunakan referensi:

-   Final BOQ.
-   Final KML.
-   Final Catuan.
-   Final Design.
-   Final Permit Plan.

Tujuan utama:

-   Memastikan pekerjaan konstruksi berjalan sesuai desain.
-   Monitoring progress secara real-time.
-   Mengelola evidence pekerjaan.
-   Mengontrol kualitas.
-   Mengontrol biaya aktual.
-   Menjaga SLA proyek.

------------------------------------------------------------------------

# 2. Implementation Position in Lifecycle

``` text
DESIGN BASELINE LOCKED

↓

PROJECT KICK OFF

↓

PREPARATION

↓

CONSTRUCTION EXECUTION

↓

QUALITY CHECK

↓

COMMISSIONING TEST
```

------------------------------------------------------------------------

# 3. Implementation Input Reference

## Technical Reference

-   Final BOQ.
-   Final KML.
-   Final Catuan.
-   Final Design.
-   Material Specification.

## Commercial Reference

-   Contract Value.
-   Cost Baseline.
-   Margin Baseline.

## Execution Reference

-   Timeline.
-   Milestone.
-   Resource Plan.

------------------------------------------------------------------------

# 4. Implementation Project Setup

Data:

  Field               Description
  ------------------- -------------------
  Implementation ID   ID pekerjaan
  Project ID          Referensi project
  Contractor          Pelaksana
  Site Manager        PIC lapangan
  Start Date          Mulai pekerjaan
  Target Finish       Target selesai
  Work Area           Area pekerjaan

------------------------------------------------------------------------

# 5. Work Breakdown Structure (WBS)

Struktur pekerjaan:

``` text
PROJECT

|

+-- Segment A

|       |

|       +-- Civil Work

|       +-- Cable Installation

|       +-- Splicing

|

+-- Segment B

        |

        +-- Civil Work

        +-- Testing
```

------------------------------------------------------------------------

# 6. Implementation Status Management

## Status Utama

## 6.1 Preparation

Tahap persiapan pekerjaan.

Aktivitas:

-   Mobilisasi.
-   Material preparation.
-   Equipment preparation.
-   Permit verification.
-   Safety preparation.

Checklist:

-   Material tersedia.
-   Team tersedia.
-   Equipment tersedia.
-   Permit tersedia.
-   Work permit approved.

------------------------------------------------------------------------

## 6.2 Survey

Construction Survey:

Tujuan:

-   Validasi titik kerja.
-   Marking lokasi.
-   Validasi akses.

Input:

-   GPS coordinate.
-   Photo.
-   Remark.

------------------------------------------------------------------------

## 6.3 On Review

Digunakan ketika:

-   Dokumen sedang diperiksa.
-   Design clarification berlangsung.
-   Approval pending.

------------------------------------------------------------------------

## 6.4 DRM

Digunakan untuk:

-   Final design verification.
-   Construction readiness.

------------------------------------------------------------------------

## 6.5 OGP (On Going Progress)

Tahap utama konstruksi.

Sub aktivitas:

1.  Galian.
2.  Tarik Kabel.
3.  Jembatan.
4.  Penyambungan.
5.  Terminasi Site.
6.  Pengukuran.

------------------------------------------------------------------------

## 6.6 Finishing

Tahap penyelesaian:

-   Restoration.
-   Cleaning.
-   Final documentation.
-   Punch list completion.

------------------------------------------------------------------------

# 7. Construction Activity Management

# 7.1 Galian Management

Objective:

Mengontrol pekerjaan sipil.

Input:

  Field
  ----------------
  Segment ID
  Location
  Start Date
  End Date
  Planned Length
  Actual Length
  Soil Condition
  Method
  Contractor

Progress:

``` text
Galian Progress %

=

Actual Completed Length

/

Total Planned Length

x 100%
```

Evidence:

-   Before excavation photo.
-   During excavation photo.
-   After restoration photo.

------------------------------------------------------------------------

# 7.2 Cable Pulling Management

Objective:

Mengontrol pemasangan kabel.

Input:

  Field
  -------------------
  Cable Type
  Drum Number
  Cable Length
  Start Point
  End Point
  Installation Date

Cable Tracking:

``` text
Cable Drum #001

Length:
5 KM

Installed:
3 KM

Remaining:
2 KM
```

Evidence:

-   Cable drum photo.
-   Pulling activity photo.
-   Route photo.

------------------------------------------------------------------------

# 7.3 Bridge Crossing Management

Untuk pekerjaan:

-   Sungai.
-   Jalan besar.
-   Infrastruktur existing.

Input:

  Field
  -------------------
  Location
  Crossing Type
  Method
  Permit
  Contractor
  Completion Status

Evidence:

-   Existing condition.
-   Installation process.
-   Completed crossing.

------------------------------------------------------------------------

# 7.4 Splicing Management

Objective:

Mengontrol penyambungan fiber.

Splicing Record:

  Field
  --------------
  Closure ID
  Location
  Fiber Core
  Splicer Name
  Date
  Result

Fiber Core Mapping:

  Core     Connection
  -------- ------------
  Core 1   Customer A
  Core 2   Customer B
  Core 3   Reserve

Evidence:

-   Closure photo.
-   Splicing photo.
-   Closure sealing photo.

------------------------------------------------------------------------

# 7.5 Site Termination Management

Input:

  Field
  -------------
  Site Name
  ODF
  Rack
  Patch Panel
  Connector
  Technician

Evidence:

-   Rack photo.
-   ODF photo.
-   Labeling photo.

------------------------------------------------------------------------

# 7.6 Measurement Management

Objective:

Validasi kualitas fiber.

Jenis:

## OTDR

Input:

-   Fiber ID.
-   Distance.
-   Loss.
-   Reflection.
-   Event Point.

## Optical Power Measurement

Input:

-   TX Power.
-   RX Power.
-   Optical Loss.
-   Margin.

------------------------------------------------------------------------

# 8. Evidence Management

## Objective

Setiap aktivitas memiliki bukti digital.

Struktur:

``` text
PROJECT

|

IMPLEMENTATION

|

ACTIVITY

|

EVIDENCE
```

------------------------------------------------------------------------

# 9. Evidence Metadata

Setiap file memiliki:

  Field
  --------------
  Evidence ID
  Activity
  Uploaded By
  Upload Date
  GPS Location
  Timestamp
  Description

------------------------------------------------------------------------

# 10. Evidence Approval Workflow

``` text
Contractor Upload

↓

Supervisor Review

↓

QA/QC Verification

↓

Approved
```

------------------------------------------------------------------------

# 11. Progress Dashboard

Menampilkan:

-   Overall progress.
-   Segment completion.
-   Schedule status.
-   Budget status.
-   Risk.

Construction metrics:

-   Total KM.
-   Installed KM.
-   Remaining KM.
-   Activity progress.

------------------------------------------------------------------------

# 12. SLA Monitoring

Contoh:

``` text
Cable Pulling

Target:
10 Days

Actual:
15 Days

Delay:
5 Days
```

------------------------------------------------------------------------

# 13. Actual Cost Tracking

Kategori:

## Material Cost

-   Purchase.
-   Quantity.
-   Invoice.

## Labor Cost

-   Man hour.
-   Team.
-   Rate.

## Equipment Cost

-   Excavator.
-   Blowing Machine.
-   OTDR.

## Permit Cost

-   Permit fee.
-   Authority.

------------------------------------------------------------------------

# 14. Cost Variance Monitoring

Perbandingan:

``` text
DRM Cost Baseline

VS

Actual Cost
```

Contoh:

``` text
Baseline Cost:

Rp3.8 M


Actual Cost:

Rp4.2 M


Variance:

+Rp400 juta
```

------------------------------------------------------------------------

# 15. Implementation Completion Criteria

-   Semua aktivitas selesai.
-   Semua evidence lengkap.
-   Semua issue closed.
-   Measurement selesai.
-   As-built tersedia.
-   Siap masuk CT/UT.

------------------------------------------------------------------------

# 16. Implementation Output

  Output                Used For
  --------------------- ------------------
  Construction Report   CT
  Evidence Package      Acceptance
  Actual Cost           Final Margin
  As Built Data         Closing
  Measurement Result    Quality Approval
