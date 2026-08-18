# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 1 --- PRODUCT FOUNDATION

------------------------------------------------------------------------

# 1. Document Information

## 1.1 Product Name

Fiber Optic Project Lifecycle & Profitability Management Platform
(FOPLP)

## 1.2 Product Type

Enterprise Web Application

## 1.3 Product Category

-   Project Lifecycle Management System
-   Engineering Management System
-   Construction Monitoring System
-   Financial Control System
-   GIS Based Fiber Management System

## 1.4 Industry Target

Primary users:

-   Telecommunication Operator
-   Internet Service Provider (ISP)
-   Fiber Optic Contractor
-   Enterprise Network Provider
-   Infrastructure Provider

## 1.5 Product Scope

Platform mencakup seluruh lifecycle pembangunan Fiber Optic:

Planning

↓

Survey

↓

Design Review Meeting (DRM)

↓

Implementation / Construction

↓

Commissioning Test (CT) / Uji Terima

↓

Closing & Handover

------------------------------------------------------------------------

# 2. Executive Summary

## 2.1 Product Overview

Fiber Optic Project Lifecycle & Profitability Management Platform
(FOPLP) adalah aplikasi enterprise yang dirancang untuk mengelola
seluruh proses proyek pembangunan jaringan Fiber Optic secara
end-to-end.

Platform menjadi pusat pengendalian proyek yang mengintegrasikan:

1.  Engineering Planning
2.  Survey Validation
3.  Design Approval
4.  Construction Monitoring
5.  Evidence Management
6.  Quality Assurance
7.  Commissioning Acceptance
8.  Financial Control
9.  Asset Handover

------------------------------------------------------------------------

## 2.2 Product Purpose

Tujuan utama platform:

Menyediakan satu sistem terintegrasi untuk memastikan proyek Fiber Optic
dapat direncanakan, dieksekusi, dikontrol, diterima, dan ditutup secara
efektif, transparan, serta menguntungkan.

------------------------------------------------------------------------

## 2.3 Core Value Proposition

## Project Visibility

Management dapat mengetahui:

-   Status proyek
-   Progress aktual
-   Risiko
-   Kendala
-   SLA

## Engineering Control

Engineering dapat mengontrol:

-   BOQ
-   Route
-   KML
-   Catuan
-   Material

## Construction Control

Tim implementasi dapat mengelola:

-   Aktivitas lapangan
-   Progress
-   Evidence
-   Quality

## Financial Control

Management dapat melihat:

-   Nilai kontrak
-   Cost
-   Profit
-   Margin
-   Dampak perubahan

------------------------------------------------------------------------

# 3. Business Problem Statement

## 3.1 Existing Condition

Saat ini proses proyek Fiber Optic masih menggunakan banyak sistem
terpisah:

  Aktivitas         Tools Existing
  ----------------- -------------------------
  BOQ               Excel
  Route Planning    Google Earth
  Survey Report     Document Manual
  Evidence          WhatsApp / Google Drive
  Progress Report   Excel
  Approval          Email
  Test Result       PDF
  Asset Record      Manual

------------------------------------------------------------------------

# 3.2 Business Impact

## Problem 1 --- Data Tidak Terintegrasi

Informasi proyek tersebar sehingga:

-   Sulit mencari data
-   Risiko kehilangan dokumen
-   Tidak ada histori perubahan

------------------------------------------------------------------------

## Problem 2 --- Tidak Ada Baseline Control

Contoh:

Planning:

Cable: 10 KM

Actual:

Cable: 15 KM

Tidak diketahui:

-   Kapan berubah
-   Mengapa berubah
-   Siapa approve
-   Dampak biaya

------------------------------------------------------------------------

## Problem 3 --- Margin Tidak Terpantau

Banyak proyek hanya melihat:

Project Completed

Namun tidak mengetahui:

Project Profitable?

Contoh:

Initial:

Contract Value: Rp5.000.000.000

Cost: Rp3.000.000.000

Margin: 40%

Actual:

Cost: Rp4.500.000.000

Margin: 10%

Penyebab:

-   Tambahan jalur
-   Permit
-   Civil work
-   Material tambahan

------------------------------------------------------------------------

## Problem 4 --- Evidence Management Tidak Terstruktur

Permasalahan:

-   Foto tersebar
-   Tidak ada timestamp
-   Tidak ada lokasi
-   Sulit audit

------------------------------------------------------------------------

## Problem 5 --- Closing Terhambat

Walaupun pekerjaan fisik selesai, dokumen belum lengkap:

-   As Built
-   KML final
-   Test result
-   BA Acceptance

Akibat:

-   Invoice delay
-   Acceptance delay
-   Asset tidak tercatat

------------------------------------------------------------------------

# 4. Product Vision

## Vision Statement

Menjadi platform digital utama untuk pengendalian lifecycle proyek Fiber
Optic yang mengintegrasikan engineering, construction, quality,
financial, dan asset management dalam satu sistem.

------------------------------------------------------------------------

# 5. Product Mission

## 5.1 Engineering Excellence

Menyediakan sistem untuk:

-   Membuat desain
-   Mengelola BOQ
-   Mengontrol perubahan
-   Menyimpan baseline

------------------------------------------------------------------------

## 5.2 Construction Transparency

Memberikan:

-   Real-time progress
-   Evidence
-   Activity tracking
-   Issue monitoring

------------------------------------------------------------------------

## 5.3 Financial Awareness

Memberikan visibility:

-   Revenue
-   Cost
-   Profit
-   Margin

------------------------------------------------------------------------

## 5.4 Operational Readiness

Memastikan:

-   Dokumentasi lengkap
-   Asset tercatat
-   Handover berjalan

------------------------------------------------------------------------

# 6. Product Objective

## Objective 1 --- Improve Project Accuracy

Target:

Mengurangi deviasi antara Planning vs Actual.

Measurement:

BOQ Accuracy \> 90%

------------------------------------------------------------------------

## Objective 2 --- Improve Project Visibility

Target:

Management dapat melihat kondisi proyek secara real-time.

------------------------------------------------------------------------

## Objective 3 --- Improve Documentation Quality

Target:

100% evidence dan dokumen terdokumentasi.

------------------------------------------------------------------------

## Objective 4 --- Protect Project Profitability

Target:

Margin proyek dapat dipantau sejak planning sampai closing.

------------------------------------------------------------------------

# 7. Overall Business Process Lifecycle

PROJECT INITIATION

↓

PLANNING

-   BOQ
-   Material
-   Route
-   Catuan
-   Cost
-   Margin

↓

SURVEY

-   Validation
-   KML Update
-   Permit
-   Change Analysis

↓

DRM

-   Final Design
-   Approval
-   Baseline Lock

↓

IMPLEMENTATION

-   Construction
-   Evidence
-   Progress
-   Cost Monitoring

↓

CT / UT

-   Testing
-   Verification
-   Acceptance

↓

CLOSING

-   Handover
-   Asset
-   Final Profitability

------------------------------------------------------------------------

# 8. Target User Role

## Project Owner

Kebutuhan:

-   Melihat progress
-   Melihat budget
-   Melihat risk
-   Melihat acceptance

## Project Manager

Kebutuhan:

-   Mengontrol timeline
-   Mengontrol team
-   Mengontrol issue
-   Mengontrol cost
-   Mengontrol SLA

## Engineering Team

Kebutuhan:

-   Mengelola BOQ
-   Mengelola design
-   Mengelola route
-   Mengelola catuan

## Survey Team

Kebutuhan:

-   Melakukan survey
-   Update route
-   Upload evidence

## Contractor

Kebutuhan:

-   Update construction progress
-   Upload evidence
-   Submit completion

## QA/QC

Kebutuhan:

-   Verification
-   Testing
-   Acceptance

## Finance / Commercial

Kebutuhan:

-   Contract value
-   Cost
-   Margin

------------------------------------------------------------------------

# 9. System Principle

## Single Source of Truth

Semua data proyek berada dalam satu platform.

## Traceability

Setiap perubahan dapat ditelusuri.

## Baseline Control

Setiap fase memiliki baseline.

## Profit Awareness

Setiap perubahan harus memiliki analisis dampak terhadap margin.
