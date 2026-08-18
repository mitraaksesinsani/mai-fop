# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 9 --- CROSS FUNCTIONAL SYSTEM

## MODULE 8 --- GIS PLATFORM MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

GIS Platform Management merupakan modul yang menyediakan representasi
visual berbasis lokasi untuk seluruh lifecycle proyek Fiber Optic.

Karena pembangunan Fiber Optic sangat bergantung pada:

-   Lokasi.
-   Jalur.
-   Segment.
-   Asset.
-   Koordinat.
-   Kondisi lapangan.

maka GIS menjadi komponen utama dalam sistem.

------------------------------------------------------------------------

# 2. GIS Capability Requirement

Sistem harus mampu:

-   Menampilkan route Fiber Optic pada peta.
-   Membandingkan desain dengan aktual.
-   Menampilkan progress berdasarkan lokasi.
-   Menampilkan asset jaringan.
-   Menghubungkan lokasi dengan evidence dan dokumen.

------------------------------------------------------------------------

# 3. GIS Data Layer

## Layer 1 --- Planning Route

Berisi:

-   Indicative KML.
-   Planned route.
-   Planned segment.

Status:

``` text
PLANNING
```

------------------------------------------------------------------------

## Layer 2 --- Survey Route

Berisi:

-   Actual survey route.
-   Perubahan jalur.
-   Survey notes.

Status:

``` text
SURVEY VALIDATION
```

------------------------------------------------------------------------

## Layer 3 --- DRM Final Route

Berisi:

-   Approved route.
-   Final segment.
-   Final design.

Status:

``` text
APPROVED DESIGN
```

------------------------------------------------------------------------

## Layer 4 --- Construction Progress Layer

Menampilkan:

-   Not Started.
-   On Progress.
-   Completed.
-   Issue.

------------------------------------------------------------------------

## Layer 5 --- Asset Layer

Menampilkan:

-   Cable.
-   Closure.
-   ODF.
-   Pole.
-   Manhole.
-   Customer Site.

------------------------------------------------------------------------

# 4. GIS Object Management

Setiap object memiliki:

  Field
  ------------------
  Object ID
  Object Type
  Coordinate
  Status
  Related Project
  Related Document

------------------------------------------------------------------------

# 5. Route Segment Management

Setiap jalur dibagi menjadi segment.

Contoh:

``` text
Segment A

POP A

|

5 KM Cable

|

Closure 01
```

Data segment:

  Field
  ------------------
  Segment ID
  Start Coordinate
  End Coordinate
  Length
  Cable Type
  Status
  Evidence

------------------------------------------------------------------------

# 6. Map Interaction

User dapat:

## Click Segment

Menampilkan:

-   BOQ item.
-   Progress.
-   Evidence.
-   Cost.
-   Issue.

------------------------------------------------------------------------

## Click Asset

Contoh Closure:

``` text
Closure ID:

CL-001


Location:

Coordinate


Fiber:

Core 1-24


Status:

Active
```

------------------------------------------------------------------------

# 7. GIS Comparison Feature

Sistem membandingkan:

``` text
PLANNING

VS

SURVEY

VS

DRM

VS

AS BUILT
```

Contoh:

Planning:

10 KM

Survey:

12 KM

As Built:

12.5 KM

Output:

``` text
Deviation:

+2.5 KM

Impact:

Additional Cost
```

------------------------------------------------------------------------

# MODULE 9 --- DASHBOARD & REPORTING SYSTEM

------------------------------------------------------------------------

# 8. Objective

Memberikan informasi yang tepat kepada setiap level pengguna.

------------------------------------------------------------------------

# 9. Executive Dashboard

Target:

-   Director.
-   Management.
-   Project Owner.

Menampilkan:

## Project Portfolio

-   Active Project.
-   Completed Project.
-   Total Project Value.

## Financial Overview

-   Contract Value.
-   Cost.
-   Profit.
-   Margin.

## Project Health

Status:

-   Green.
-   Yellow.
-   Red.

------------------------------------------------------------------------

# 10. Project Manager Dashboard

Menampilkan:

## Progress

-   Overall progress.
-   Segment completion.
-   Schedule.

## Issue

-   Open issue.
-   Delay.
-   Permit problem.

## Documentation

-   Evidence completeness.
-   Pending approval.

## Financial

-   Cost variance.
-   Margin risk.

------------------------------------------------------------------------

# 11. Engineering Dashboard

Menampilkan:

-   BOQ status.
-   KML status.
-   Catuan status.
-   Change request.

------------------------------------------------------------------------

# 12. Construction Dashboard

Menampilkan:

## Productivity

Contoh:

``` text
Daily Production:

500 meter/day

Target:

700 meter/day
```

## Activity Status

  Activity   Progress
  ---------- ----------
  Galian     70%
  Pulling    50%
  Splicing   40%
  Testing    10%

------------------------------------------------------------------------

# 13. Customer Dashboard

Customer dapat melihat:

-   Project progress.
-   Milestone.
-   Approval request.
-   Acceptance status.

------------------------------------------------------------------------

# 14. Automated Reporting

System menghasilkan:

## Daily Report

-   Progress.
-   Activity.
-   Issue.
-   Evidence.

## Weekly Report

-   Timeline.
-   Risk.
-   Achievement.

## Monthly Report

-   Financial.
-   Quality.
-   SLA.

------------------------------------------------------------------------

# MODULE 10 --- SLA MANAGEMENT SYSTEM

------------------------------------------------------------------------

# 15. Objective

Mengontrol ketepatan waktu setiap proses proyek.

------------------------------------------------------------------------

# 16. SLA Parameter

Contoh:

## Survey Approval

Target:

7 hari.

## DRM Approval

Target:

5 hari.

## Permit Approval

Target:

30 hari.

## Construction Completion

Target:

90 hari.

------------------------------------------------------------------------

# 17. SLA Calculation

Formula:

``` text
SLA Achievement

=

Actual Duration

/

Target Duration

x 100%
```

------------------------------------------------------------------------

# 18. SLA Status

## On Track

Sesuai target.

## Warning

Mendekati deadline.

## Overdue

Melewati target.

------------------------------------------------------------------------

# 19. SLA Alert

Contoh:

"Project FO Jakarta-Bandung mengalami keterlambatan DRM Approval selama
3 hari."

------------------------------------------------------------------------

# MODULE 11 --- NOTIFICATION ENGINE

------------------------------------------------------------------------

# 20. Objective

Memberikan informasi otomatis kepada stakeholder.

------------------------------------------------------------------------

# 21. Notification Trigger

## Approval

-   BOQ menunggu approval.
-   DRM menunggu approval.
-   CT menunggu acceptance.

## Documentation

-   Evidence belum lengkap.
-   Dokumen expired.

## Construction

-   Progress terlambat.
-   Cost overrun.

------------------------------------------------------------------------

# 22. Notification Channel

Support:

-   Web notification.
-   Email.
-   Mobile push.
-   WhatsApp integration (future).
