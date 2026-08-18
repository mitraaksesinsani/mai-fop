# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 9 --- CROSS FUNCTIONAL SYSTEM

## MODULE 9 --- DASHBOARD & REPORTING SYSTEM

## MODULE 10 --- SLA MANAGEMENT SYSTEM

## MODULE 11 --- NOTIFICATION ENGINE

------------------------------------------------------------------------

# MODULE 9 --- DASHBOARD & REPORTING SYSTEM

# 1. Module Overview

## 1.1 Objective

Dashboard & Reporting System menyediakan informasi terstruktur untuk
seluruh level pengguna agar dapat mengambil keputusan berdasarkan data
aktual proyek.

Dashboard harus memberikan visibility terhadap:

-   Progress proyek.
-   Status engineering.
-   Status konstruksi.
-   Financial performance.
-   Risk.
-   SLA.
-   Documentation completeness.

------------------------------------------------------------------------

# 2. Dashboard User Level

## 2.1 Executive Dashboard

Target:

-   Director.
-   Management.
-   Project Owner.

Informasi:

## Project Portfolio

Menampilkan:

-   Total project aktif.
-   Total project selesai.
-   Total nilai proyek.
-   Distribusi project berdasarkan status.

------------------------------------------------------------------------

## Financial Overview

Menampilkan:

-   Contract value.
-   Estimated cost.
-   Actual cost.
-   Profit.
-   Margin percentage.

------------------------------------------------------------------------

## Project Health Indicator

Status:

### Green

Project sesuai target.

### Yellow

Project memiliki potensi risiko.

### Red

Project mengalami masalah kritis.

------------------------------------------------------------------------

# 3. Project Manager Dashboard

Menampilkan:

## Progress Monitoring

-   Overall progress.
-   Segment completion.
-   Milestone status.
-   Schedule deviation.

------------------------------------------------------------------------

## Issue Monitoring

Menampilkan:

-   Open issue.
-   Delay.
-   Permit issue.
-   Technical issue.

------------------------------------------------------------------------

## Documentation Monitoring

Menampilkan:

-   Evidence completeness.
-   Pending approval.
-   Missing document.

------------------------------------------------------------------------

## Financial Monitoring

Menampilkan:

-   Cost variance.
-   Margin risk.
-   Additional cost.

------------------------------------------------------------------------

# 4. Engineering Dashboard

Menampilkan:

-   BOQ status.
-   KML status.
-   Catuan status.
-   Change request.
-   Design approval.

------------------------------------------------------------------------

# 5. Construction Dashboard

Menampilkan:

## Physical Progress

Contoh:

Total Cable:

20 KM

Installed:

12 KM

Progress:

60%

------------------------------------------------------------------------

## Activity Progress

  Activity        Progress
  --------------- ----------
  Galian          70%
  Cable Pulling   50%
  Splicing        40%
  Testing         10%

------------------------------------------------------------------------

# 6. Customer Dashboard

Customer dapat melihat:

-   Project progress.
-   Milestone.
-   Approval request.
-   Acceptance status.
-   Outstanding issue.

------------------------------------------------------------------------

# 7. Automated Reporting

System menghasilkan:

## Daily Report

Isi:

-   Progress.
-   Activity.
-   Issue.
-   Evidence.

------------------------------------------------------------------------

## Weekly Report

Isi:

-   Timeline.
-   Achievement.
-   Risk.
-   Recovery plan.

------------------------------------------------------------------------

## Monthly Report

Isi:

-   Financial.
-   Quality.
-   SLA.
-   Overall performance.

------------------------------------------------------------------------

# MODULE 10 --- SLA MANAGEMENT SYSTEM

# 8. Objective

SLA Management digunakan untuk mengontrol ketepatan waktu seluruh proses
proyek.

------------------------------------------------------------------------

# 9. SLA Parameter

Contoh:

## Survey Approval

Target:

7 hari.

------------------------------------------------------------------------

## DRM Approval

Target:

5 hari.

------------------------------------------------------------------------

## Permit Approval

Target:

30 hari.

------------------------------------------------------------------------

## Construction Completion

Target:

90 hari.

------------------------------------------------------------------------

# 10. SLA Calculation

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

# 11. SLA Status

## On Track

Pekerjaan masih sesuai target.

## Warning

Pekerjaan mendekati batas waktu.

## Overdue

Pekerjaan melewati SLA.

------------------------------------------------------------------------

# 12. SLA Alert

Contoh:

"Project Fiber Optic mengalami keterlambatan DRM Approval selama 3
hari."

------------------------------------------------------------------------

# MODULE 11 --- NOTIFICATION ENGINE

# 13. Objective

Notification Engine memberikan informasi otomatis kepada stakeholder
berdasarkan kondisi sistem.

------------------------------------------------------------------------

# 14. Notification Trigger

## Approval Trigger

Contoh:

-   BOQ menunggu approval.
-   DRM menunggu approval.
-   CT menunggu acceptance.

------------------------------------------------------------------------

## Documentation Trigger

Contoh:

-   Evidence belum lengkap.
-   Dokumen expired.
-   Approval pending.

------------------------------------------------------------------------

## Construction Trigger

Contoh:

-   Progress terlambat.
-   Cost overrun.
-   Issue belum selesai.

------------------------------------------------------------------------

# 15. Notification Channel

Support:

-   Web notification.
-   Email.
-   Mobile push.
-   WhatsApp integration (future).

------------------------------------------------------------------------

# 16. Success Criteria

Module berhasil apabila:

-   Management memiliki visibility real-time.
-   Report dapat dibuat otomatis.
-   SLA dapat dimonitor.
-   Stakeholder menerima notifikasi sesuai kebutuhan.
