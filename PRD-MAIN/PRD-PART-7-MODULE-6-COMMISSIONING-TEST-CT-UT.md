# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 7 --- COMMISSIONING TEST (CT) / UJI TERIMA (UT)

## MODULE 6 --- COMMISSIONING TEST & ACCEPTANCE MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Commissioning Test (CT) / Uji Terima (UT) merupakan tahap validasi akhir
untuk memastikan hasil implementasi Fiber Optic:

-   Sesuai dengan desain final DRM.
-   Sesuai dengan BOQ final.
-   Sesuai standar kualitas teknis.
-   Memenuhi requirement customer.
-   Siap digunakan secara operasional.
-   Siap masuk tahap handover dan closing.

------------------------------------------------------------------------

# 2. CT/UT Position in Lifecycle

``` text
IMPLEMENTATION COMPLETE

↓

QUALITY VERIFICATION

↓

COMMISSIONING TEST

↓

CUSTOMER ACCEPTANCE

↓

HANDOVER

↓

PROJECT CLOSING
```

------------------------------------------------------------------------

# 3. CT/UT Input Reference

## Technical Baseline

-   Final BOQ DRM.
-   Final KML DRM.
-   Final Catuan DRM.
-   Final Design.
-   Construction Evidence.

## Commercial Baseline

-   Final Contract Value.
-   Final Cost.
-   Margin Baseline.

## Implementation Result

-   Actual Installation.
-   Actual Material.
-   Actual Measurement.
-   As Built Data.

------------------------------------------------------------------------

# 4. CT Preparation Management

## CT Preparation Checklist

-   Implementation completed.
-   All evidence uploaded.
-   As Built drawing available.
-   Final KML available.
-   Test equipment calibrated.
-   Customer schedule confirmed.

------------------------------------------------------------------------

# 5. Commissioning Package

System membuat:

## Technical Document

Berisi:

-   Final BOQ.
-   Final KML.
-   Fiber Allocation.
-   Splice Map.
-   As Built Drawing.

## Testing Document

Berisi:

-   OTDR Result.
-   Optical Power Result.
-   Measurement Report.

## Evidence Document

Berisi:

-   Installation Photo.
-   Termination Photo.
-   Closure Photo.
-   Site Photo.

------------------------------------------------------------------------

# 6. Final BOQ Verification

## Objective

Memastikan material yang terpasang sesuai BOQ.

Comparison:

``` text
DRM BOQ

VS

Installed BOQ

VS

Final Acceptance BOQ
```

Contoh:

  Item       DRM     Installed   Status
  ---------- ------- ----------- --------
  FO Cable   15 KM   15 KM       OK
  Closure    20      20          OK
  ODF        5       5           OK

------------------------------------------------------------------------

# 7. KML Verification

## Objective

Memastikan jalur aktual sesuai desain.

Validation:

-   Route Match.
-   Distance.
-   Segment.
-   Coordinate.

------------------------------------------------------------------------

# 8. Final Catuan Verification

## Objective

Memastikan koneksi end-to-end.

Verification:

-   Source Node.
-   Destination Node.
-   Fiber Core.
-   Closure.
-   ODF.
-   Customer Endpoint.

Contoh:

``` text
POP A

|

Core 01-04

|

Closure 01

|

ODF Customer

|

Router
```

Status:

PASS

------------------------------------------------------------------------

# 9. Fiber Testing Management

## 9.1 OTDR Test Management

Objective:

Mengukur kualitas jalur fiber.

Input:

  Field
  ------------
  Test ID
  Fiber ID
  Direction
  Wavelength
  Distance
  Total Loss
  Event Loss
  Reflection
  Tester

------------------------------------------------------------------------

## 9.2 Optical Power Measurement

Input:

  Field
  ----------
  Fiber ID
  TX Power
  RX Power
  Loss
  Margin
  Result

Contoh:

``` text
Fiber Core:

01

TX:

+3 dBm

RX:

-10 dBm

Loss:

13 dB

Result:

PASS
```

------------------------------------------------------------------------

# 10. Measurement Result Management

Setiap hasil testing memiliki:

-   File PDF.
-   Raw data.
-   Technician.
-   Timestamp.
-   Location.

------------------------------------------------------------------------

# 11. Acceptance Checklist

## Technical Acceptance

Checklist:

-   Fiber continuity OK.
-   OTDR Pass.
-   Power Meter Pass.
-   Splicing quality OK.
-   Labeling complete.
-   Rack installation OK.

## Documentation Acceptance

Checklist:

-   BOQ Final.
-   KML Final.
-   As Built Drawing.
-   Evidence lengkap.
-   Permit document.

------------------------------------------------------------------------

# 12. Punch List Management

Jika ditemukan ketidaksesuaian:

Input:

  Field
  ---------------
  Punch List ID
  Description
  Location
  Category
  Severity
  PIC
  Due Date
  Status

Severity:

## Minor

Tidak menghambat acceptance.

## Major

Harus diperbaiki sebelum acceptance.

## Critical

Menghambat operasional.

------------------------------------------------------------------------

# 13. Punch List Workflow

``` text
Finding Issue

↓

Assign PIC

↓

Correction

↓

Verification

↓

Closed
```

------------------------------------------------------------------------

# 14. CT Result Status

## PASS

Semua requirement terpenuhi.

## PASS WITH REMARK

Ada catatan minor.

## FAILED

Perlu perbaikan.

------------------------------------------------------------------------

# 15. CT Approval Workflow

``` text
QA/QC

↓

Project Manager

↓

Customer Technical Team

↓

Acceptance Approved
```

------------------------------------------------------------------------

# 16. Berita Acara Uji Terima (BAUT)

System generate:

Isi:

## Project Information

-   Project Name.
-   Customer.
-   Location.

## Scope Acceptance

-   Route.
-   Fiber Capacity.
-   Installation Scope.

## Test Result

-   OTDR.
-   Power Measurement.

## Attachment

-   BOQ.
-   KML.
-   Evidence.
-   Test Report.

------------------------------------------------------------------------

# 17. Final Margin Calculation After CT

Formula:

``` text
Final Revenue

-

Actual Cost

=

Actual Profit
```

Contoh:

``` text
Contract Value:

Rp5 M

Actual Cost:

Rp4.1 M

Actual Profit:

Rp900 juta

Final Margin:

18%
```

------------------------------------------------------------------------

# 18. Margin Comparison

Dashboard:

  Stage      Margin
  ---------- --------
  Planning   30%
  Survey     24%
  DRM        24%
  Closing    18%

------------------------------------------------------------------------

# 19. Root Cause Margin Change

System mencatat:

-   Additional Civil Work.
-   Permit Cost.
-   Additional Cable Length.
-   Productivity Loss.

------------------------------------------------------------------------

# 20. CT Completion Criteria

-   Semua test selesai.
-   Semua punch list selesai.
-   Customer approve.
-   BA Uji Terima signed.
-   Final document complete.

------------------------------------------------------------------------

# 21. CT Output

  Output          Used For
  --------------- --------------------
  Test Report     Closing
  BA Uji Terima   Handover
  Final BOQ       Asset Record
  Final KML       Network Database
  Final Margin    Project Evaluation
