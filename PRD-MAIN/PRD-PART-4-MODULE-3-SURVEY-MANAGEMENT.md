# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 4 --- SURVEY MANAGEMENT MODULE

## MODULE 3 --- SURVEY MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Survey Management Module merupakan proses validasi kondisi lapangan
terhadap hasil Planning.

Tujuan utama:

-   Memastikan desain indikatif sesuai kondisi aktual.
-   Memvalidasi jalur Fiber Optic.
-   Mengidentifikasi perubahan desain.
-   Mengidentifikasi kebutuhan izin.
-   Mengukur dampak perubahan terhadap biaya dan margin.

------------------------------------------------------------------------

# 2. Survey Position in Lifecycle

``` text
PLANNING BASELINE

↓

SURVEY EXECUTION

↓

FIELD VALIDATION

↓

CHANGE IDENTIFICATION

↓

DESIGN ADJUSTMENT

↓

DRM INPUT
```

------------------------------------------------------------------------

# 3. Survey Input Reference

Survey membawa seluruh referensi planning:

-   Indicative BOQ.
-   Indicative KML.
-   Initial Route.
-   Initial Catuan.
-   Cable Type.
-   Cost Baseline.
-   Margin Baseline.

------------------------------------------------------------------------

# 4. Survey Preparation

## 4.1 Survey Task Assignment

Data:

  Field               Description
  ------------------- -----------------
  Survey ID           Nomor survey
  Project ID          Project terkait
  Survey Area         Area pekerjaan
  Survey PIC          Surveyor
  Start Date          Tanggal mulai
  Target Completion   Target selesai

------------------------------------------------------------------------

# 5. Field Survey Module

Surveyor dapat:

-   Melihat route planning.
-   Input kondisi lapangan.
-   Upload foto.
-   Update route.
-   Input perubahan.
-   Input kondisi jalan.
-   Input kebutuhan permit.

------------------------------------------------------------------------

# 6. Route Validation Management

## Objective

Membandingkan:

Planning Route

VS

Actual Field Condition

------------------------------------------------------------------------

# 7. Route Comparison Example

Planning:

``` text
Segment A-B

Distance:
5 KM

Installation:
Underground

Road:
Provincial Road
```

Survey Result:

``` text
Segment A-B

Distance:
6.5 KM

Installation:
Aerial

Road:
Private Area
```

------------------------------------------------------------------------

# 8. Route Difference Tracking

  Parameter    Planning        Actual
  ------------ --------------- ------------------
  Distance     5 KM            6.5 KM
  Cable Type   Underground     Aerial
  Route        Existing Road   Alternative Road
  Cost         Rp500 jt        Rp700 jt

------------------------------------------------------------------------

# 9. Change Reason Management

Setiap perubahan wajib memiliki alasan.

Master Reason:

  Code   Reason
  ------ -------------------------
  CH01   Existing Infrastructure
  CH02   Permit Issue
  CH03   Road Condition
  CH04   Cost Optimization
  CH05   Customer Request
  CH06   Safety Requirement
  CH07   Environmental Condition
  CH08   Technical Limitation

------------------------------------------------------------------------

# 10. Catuan Validation

## Objective

Memastikan hubungan end-to-end fiber sesuai kondisi aktual.

Planning:

``` text
POP A

|

Closure 01

|

ODP 01

|

Customer Site
```

Survey:

``` text
POP A

|

Closure 01

|

Closure 02

|

ODP 01

|

Customer Site
```

------------------------------------------------------------------------

# 11. Catuan Change Impact

Perubahan dianalisa terhadap:

## Engineering Impact

-   Tambahan closure.
-   Tambahan splice.
-   Perubahan core allocation.

## Financial Impact

Contoh:

Sebelum:

Closure: 10 Unit

Cost: Rp100 juta

Sesudah:

Closure: 15 Unit

Additional Cost: Rp50 juta

------------------------------------------------------------------------

# 12. Cable Underground / Aerial Validation

## Underground Validation

Input:

-   Route Segment.
-   Soil Condition.
-   Existing Duct.
-   Excavation Requirement.
-   Road Crossing.
-   Protection Requirement.

------------------------------------------------------------------------

## Aerial Validation

Input:

-   Existing Pole.
-   New Pole Requirement.
-   Pole Distance.
-   Messenger Requirement.
-   Joint Usage Condition.

------------------------------------------------------------------------

# 13. Road & Permit Management

## Mandatory Module

Jenis area:

-   Desa.
-   RT/RW.
-   Kecamatan.
-   Kelurahan.
-   Provinsi.
-   Nasional.
-   Private Area.

------------------------------------------------------------------------

# 14. Road Classification

## Desa

Data:

-   Nama Desa.
-   Authority.
-   PIC.
-   Permit Requirement.

## RT/RW

Data:

-   Ketua RT.
-   Ketua RW.
-   Approval Status.

## Kecamatan

Data:

-   Kecamatan.
-   Permit Type.
-   Document Number.

## Kelurahan

Data:

-   Kelurahan.
-   PIC.
-   Status.

## Provinsi

Data:

-   Jalan Provinsi.
-   Dinas terkait.

## Nasional

Data:

-   Jalan Nasional.
-   Authority.

## Private Area

Contoh:

-   Kawasan Industri.
-   Estate.
-   Mall.
-   Apartment.

Data:

-   Area Name.
-   Owner.
-   Permit PIC.
-   Agreement Status.
-   Access Rule.

------------------------------------------------------------------------

# 15. Permit Management

Setiap izin memiliki:

  Field
  -----------------
  Permit ID
  Location
  Authority
  Permit Type
  Submission Date
  Approval Date
  Expiry Date
  Status

Status:

``` text
Draft

↓

Submitted

↓

Review

↓

Approved

↓

Expired
```

------------------------------------------------------------------------

# 16. Survey Evidence Management

Evidence:

## Photo

Metadata:

-   Timestamp.
-   GPS.
-   Surveyor.
-   Location.

## Video

Untuk:

-   Crossing.
-   Area kritikal.

## Document

Contoh:

-   Surat izin.
-   Existing infrastructure.

------------------------------------------------------------------------

# 17. Survey Issue Management

Input:

  Field
  -------------------
  Issue ID
  Description
  Location
  Severity
  Impact
  Proposed Solution

Severity:

-   Low.
-   Medium.
-   High.

------------------------------------------------------------------------

# 18. Survey Margin Impact Analysis

Survey terintegrasi dengan Financial Control.

Contoh:

Planning:

``` text
Revenue:
Rp5 M

Cost:
Rp3 M

Margin:
40%
```

Survey:

-   Tambahan 3 KM cable.
-   Tambahan permit.
-   Tambahan civil work.

Result:

``` text
Revenue:
Rp5 M

Cost:
Rp4 M

Margin:
20%
```

System Alert:

``` text
Margin turun 20%

Root Cause:
- Route Change
- Permit Cost
- Additional Civil Work
```

------------------------------------------------------------------------

# 19. Survey Approval Workflow

``` text
Surveyor

↓

Engineering Review

↓

Project Manager Review

↓

Commercial Impact Review

↓

Survey Approved
```

------------------------------------------------------------------------

# 20. Survey Output Document

Berita Acara Survey berisi:

-   Project Information.
-   Survey Result.
-   BOQ Comparison.
-   Updated KML.
-   Photo Evidence.
-   Permit Documentation.

------------------------------------------------------------------------

# 21. Survey Output

  Output             Used For
  ------------------ ---------------------
  Final Survey BOQ   DRM
  Survey KML         DRM
  Updated Catuan     DRM
  Permit Data        Implementation
  Change Reason      Change Control
  Margin Impact      Commercial Decision

------------------------------------------------------------------------

# 22. Success Criteria

Module berhasil apabila:

-   Kondisi lapangan tervalidasi.
-   Perubahan terdokumentasi.
-   Permit teridentifikasi.
-   BOQ survey tersedia.
-   KML survey tersedia.
-   Dampak margin diketahui.
