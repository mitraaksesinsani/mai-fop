# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 5 --- DESIGN REVIEW MEETING (DRM)

## MODULE 4 --- DESIGN REVIEW MEETING MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Design Review Meeting (DRM) merupakan tahap penguncian desain final
sebelum masuk ke tahap implementasi.

Tujuan utama:

-   Memastikan hasil survey tervalidasi.
-   Menetapkan BOQ final.
-   Menetapkan KML final.
-   Menetapkan catuan final.
-   Menyetujui metode implementasi.
-   Menetapkan baseline biaya dan margin.

------------------------------------------------------------------------

# 2. DRM Position in Lifecycle

``` text
SURVEY VALIDATED

↓

ENGINEERING REVIEW

↓

DRM PREPARATION

↓

DRM MEETING

↓

APPROVAL

↓

DESIGN BASELINE LOCKED

↓

IMPLEMENTATION
```

------------------------------------------------------------------------

# 3. DRM Input Reference

DRM menggunakan:

## Technical Input

-   Survey BOQ.
-   Survey KML.
-   Survey Catuan.
-   Survey Evidence.
-   Permit Information.
-   Change Reason.

## Commercial Input

-   Final Revenue.
-   Final Cost.
-   Margin Simulation.
-   Change Impact.

------------------------------------------------------------------------

# 4. DRM Preparation Module

Sebelum meeting, Engineering menyiapkan DRM Package.

## Technical Package

Berisi:

-   Final Route Design.
-   Final KML.
-   Fiber Allocation.
-   Cable Installation Method.
-   Splice Plan.
-   Termination Plan.

## Commercial Package

Berisi:

-   Final BOQ.
-   Contract Value.
-   Estimated Cost.
-   Margin.

## Implementation Package

Berisi:

-   Work Breakdown Structure.
-   Timeline.
-   Milestone.
-   Resource Requirement.

------------------------------------------------------------------------

# 5. DRM Meeting Management

## DRM Event Data

  Field          Description
  -------------- -------------------
  DRM ID         Unique ID
  Project ID     Project reference
  Date           Meeting date
  Location       Meeting location
  Participants   Attendee
  Agenda         Discussion topic

------------------------------------------------------------------------

# 6. DRM Discussion Management

Setiap pembahasan dicatat.

  Field
  ---------------
  Discussion ID
  Topic
  Description
  Decision
  PIC
  Due Date

------------------------------------------------------------------------

# 7. BOQ Finalization

## Objective

Mengubah BOQ hasil survey menjadi BOQ resmi implementasi.

------------------------------------------------------------------------

# 8. BOQ Comparison

Sistem membandingkan:

``` text
Planning BOQ

VS

Survey BOQ

VS

DRM Final BOQ
```

Contoh:

  Item       Planning   Survey   DRM
  ---------- ---------- -------- -------
  Cable      10 KM      13 KM    13 KM
  Closure    10         15       15
  Splicing   100        150      150

------------------------------------------------------------------------

# 9. BOQ Approval Rule

BOQ final apabila:

-   Engineering approve.
-   Project Manager approve.
-   Customer approve.

------------------------------------------------------------------------

# 10. BOQ Lock

Setelah approved:

``` text
BOQ FINAL

LOCKED
```

Perubahan wajib melalui:

-   Change Request.
-   Approval tambahan.

------------------------------------------------------------------------

# 11. Final KML Management

## Objective

Menetapkan jalur implementasi resmi.

------------------------------------------------------------------------

# 12. KML Versioning

``` text
KML V0.1

Initial Design

↓

KML V0.2

Survey Update

↓

KML V1.0

DRM Approved
```

------------------------------------------------------------------------

# 13. GIS DRM View

User dapat melihat:

-   Planning Route.
-   Survey Route.
-   Final DRM Route.

------------------------------------------------------------------------

# 14. Final Catuan Management

## Objective

Mengunci desain koneksi end-to-end.

Contoh:

``` text
POP JAKARTA

|

48 Core Cable

|

Closure A

|

Closure B

|

ODF Customer

|

Customer Router
```

------------------------------------------------------------------------

# 15. Catuan Approval Checklist

-   Source node valid.
-   Destination valid.
-   Fiber core allocation valid.
-   Splice plan valid.
-   Reserve core tersedia.

------------------------------------------------------------------------

# 16. Cable Installation Finalization

DRM menentukan:

## Underground

-   Route.
-   Depth.
-   Protection.
-   Duct requirement.

## Aerial

-   Pole route.
-   Span distance.
-   Attachment point.

------------------------------------------------------------------------

# 17. Permit Final Review

Sebelum implementasi:

  Requirement           Status
  --------------------- ----------
  Road Permit           Approved
  Private Area Access   Approved
  Government Permit     Approved
  Community Approval    Approved

------------------------------------------------------------------------

# 18. Final Financial Review

Menampilkan:

``` text
Contract Value

Rp5.000.000.000


Total Cost

Rp3.800.000.000


Expected Profit

Rp1.200.000.000


Margin

24%
```

------------------------------------------------------------------------

# 19. Margin Approval Threshold

## Green

Margin \>30%

Action:

Proceed.

## Yellow

Margin 15%-30%

Action:

Management Review.

## Red

Margin \<15%

Action:

Commercial Approval Required.

------------------------------------------------------------------------

# 20. DRM Decision Management

Status:

## Approved

Lanjut implementasi.

## Approved With Note

Lanjut dengan catatan.

## Revision Required

Kembali ke engineering.

------------------------------------------------------------------------

# 21. DRM Approval Workflow

``` text
Engineering

↓

Project Manager

↓

Commercial / Finance

↓

Customer

↓

DRM APPROVED
```

------------------------------------------------------------------------

# 22. Design Baseline Lock

Setelah DRM selesai:

``` text
DESIGN BASELINE

LOCKED
```

Data terkunci:

-   BOQ.
-   KML.
-   Catuan.
-   Cable Type.
-   Permit Plan.
-   Cost Baseline.
-   Margin Baseline.

------------------------------------------------------------------------

# 23. Change Request Management After DRM

Semua perubahan setelah locked harus melalui Change Request.

Data:

  Field
  --------------------
  CR Number
  Request Date
  Requestor
  Change Description
  Reason
  Technical Impact
  Cost Impact
  Schedule Impact
  Margin Impact

------------------------------------------------------------------------

# 24. DRM Output Document

Dokumen:

-   DRM Minutes of Meeting.
-   Final BOQ.
-   Final KML.
-   Final Catuan.
-   Approval History.

------------------------------------------------------------------------

# 25. DRM Completion Criteria

-   BOQ approved.
-   KML approved.
-   Catuan approved.
-   Permit reviewed.
-   Margin reviewed.
-   Approval completed.
