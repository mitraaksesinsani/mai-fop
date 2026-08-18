# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 3 --- PLANNING MANAGEMENT MODULE

## MODULE 2 --- PLANNING MANAGEMENT

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Planning Management Module merupakan tahap awal lifecycle proyek Fiber
Optic yang bertujuan untuk mendefinisikan kebutuhan proyek sebelum masuk
ke tahap survey dan implementasi.

Modul ini menghasilkan baseline awal yang mencakup:

-   Indicative BOQ.
-   Material planning.
-   Route planning.
-   Fiber allocation / catuan end-to-end.
-   Cable installation method.
-   Commercial calculation.
-   Margin simulation.

------------------------------------------------------------------------

# 2. Planning Position in Project Lifecycle

``` text
PROJECT INITIATION

↓

PLANNING

↓

SURVEY

↓

DRM

↓

IMPLEMENTATION

↓

CT / UT

↓

CLOSING
```

Planning menjadi referensi utama untuk proses:

-   Survey validation.
-   Design review.
-   Construction execution.
-   Financial monitoring.

------------------------------------------------------------------------

# 3. Planning Workflow

``` text
Project Requirement

↓

Create Indicative BOQ

↓

Define Material

↓

Define Route

↓

Define Fiber Allocation

↓

Define Cable Method

↓

Commercial Calculation

↓

Margin Simulation

↓

Planning Baseline Created
```

------------------------------------------------------------------------

# 4. Project Requirement Input

## 4.1 Requirement Definition

Data awal yang dibutuhkan:

  Field                  Description
  ---------------------- ---------------------------
  Customer Requirement   Kebutuhan client
  Service Type           Backbone / Metro / FTTx
  Capacity Requirement   Kebutuhan kapasitas fiber
  Origin Node            Titik awal
  Destination Node       Titik tujuan
  Target SLA             Requirement layanan
  Target Completion      Target penyelesaian

------------------------------------------------------------------------

# 5. BOQ Management

## 5.1 Objective

Menghasilkan estimasi kebutuhan pekerjaan dan nilai proyek berdasarkan
scope teknis.

------------------------------------------------------------------------

# 5.2 BOQ Structure

BOQ terdiri dari:

## A. Material Item

Contoh:

-   Fiber Optic Cable.
-   HDPE Pipe.
-   Closure.
-   ODF.
-   OTB.
-   Rack.
-   Patch Cord.

## B. Civil Work

Contoh:

-   Excavation.
-   Duct installation.
-   Manhole.
-   Handhole.
-   Pole installation.
-   Road crossing.

## C. Installation Work

Contoh:

-   Cable pulling.
-   Blowing.
-   Splicing.
-   Termination.
-   Testing.

## D. Supporting Cost

Contoh:

-   Survey.
-   Permit.
-   Transportation.
-   Mobilization.
-   Documentation.

------------------------------------------------------------------------

# 6. BOQ Detail Data Structure

Setiap item BOQ memiliki:

  Field              Description
  ------------------ ----------------------------
  Item Number        Nomor item
  Category           Material / Civil / Service
  Item Name          Nama pekerjaan/material
  Specification      Detail teknis
  Unit               KM / Meter / Unit
  Quantity           Jumlah
  Location Segment   Lokasi
  Remark             Catatan

------------------------------------------------------------------------

# 7. BOQ Version Management

Setiap perubahan BOQ memiliki versi.

Contoh:

``` text
BOQ V0.1

Initial Planning

↓

BOQ V0.2

Engineering Update

↓

BOQ V0.3

Survey Adjustment

↓

BOQ V1.0

Final DRM Approved
```

------------------------------------------------------------------------

# 8. Material Management

## 8.1 Objective

Mengelola database material Fiber Optic.

------------------------------------------------------------------------

# 8.2 Fiber Cable Master Data

Attribute:

-   Core Capacity.
-   Single Mode / Multi Mode.
-   Armored / Non Armored.
-   Underground / Aerial.
-   Manufacturer.

------------------------------------------------------------------------

# 8.3 Closure Master Data

Attribute:

-   Capacity.
-   Type.
-   Outdoor / Indoor.
-   IP Rating.

------------------------------------------------------------------------

# 8.4 ODF Master Data

Attribute:

-   Port Capacity.
-   Rack Size.
-   Connector Type.

------------------------------------------------------------------------

# 9. Fiber Allocation / Catuan End-to-End

## 9.1 Objective

Mendefinisikan hubungan koneksi Fiber Optic dari sumber sampai tujuan.

------------------------------------------------------------------------

# 9.2 Fiber Path Example

``` text
POP A

|

48 Core Fiber Cable

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

# 9.3 Fiber Allocation Data

  Field              Description
  ------------------ -----------------
  Source Node        Titik awal
  Destination Node   Titik akhir
  Cable Core         Jumlah core
  Used Core          Core digunakan
  Reserve Core       Cadangan
  Splice Point       Titik sambungan
  Route Segment      Jalur

------------------------------------------------------------------------

# 10. Cable Installation Type Management

## 10.1 Underground Cable

Jenis:

### Direct Buried

Data:

-   Kedalaman galian.
-   Jenis tanah.
-   Protection requirement.

### Duct Installation

Data:

-   HDPE size.
-   Jumlah duct.
-   Manhole.

### Microduct

Data:

-   Tube capacity.
-   Blowing requirement.

------------------------------------------------------------------------

## 10.2 Aerial Cable

Data:

-   Existing pole.
-   New pole requirement.
-   Span distance.
-   Messenger wire.
-   Joint usage.

------------------------------------------------------------------------

# 11. Route Planning Management

## 11.1 Objective

Mendefinisikan jalur indikatif sebelum survey.

------------------------------------------------------------------------

# 11.2 Route Segment

Data:

  Field
  ---------------------
  Segment ID
  Start Point
  End Point
  Distance
  Cable Type
  Installation Method
  Estimated Cost

------------------------------------------------------------------------

# 12. Google Earth KML Management

## 12.1 Requirement

Sistem mendukung:

-   Upload KML.
-   Upload KMZ.
-   Version management.

------------------------------------------------------------------------

# 12.2 KML Metadata

  Field
  -------------
  Upload Date
  Uploaded By
  Version
  Description

------------------------------------------------------------------------

# 13. Commercial BOQ Management

## 13.1 Objective

Menghubungkan kebutuhan teknis dengan nilai bisnis proyek.

------------------------------------------------------------------------

# 13.2 Pricing Component

Setiap item memiliki:

## Internal Cost

Harga biaya internal.

Contoh:

``` text
Fiber Cable 48 Core

Cost:
Rp30.000.000/KM
```

------------------------------------------------------------------------

## Client Price

Harga jual kepada client.

Contoh:

``` text
Fiber Cable 48 Core

Selling Price:
Rp45.000.000/KM
```

------------------------------------------------------------------------

# 14. Financial Calculation

Formula:

``` text
Revenue

=

Quantity x Client Price


Cost

=

Quantity x Internal Cost


Profit

=

Revenue - Cost


Margin %

=

(Profit / Revenue) x 100
```

------------------------------------------------------------------------

# 15. Margin Simulation

## Objective

Mengetahui potensi profit sebelum implementasi.

Contoh:

``` text
Contract Value:

Rp5.000.000.000


Estimated Cost:

Rp3.500.000.000


Estimated Profit:

Rp1.500.000.000


Margin:

30%
```

------------------------------------------------------------------------

# 16. Planning Output

Output:

  Output            Used For
  ----------------- -------------------
  Indicative BOQ    Survey
  Indicative KML    Survey
  Initial Catuan    Survey
  Cable Type        Survey
  Cost Baseline     Financial Control
  Margin Baseline   Profit Monitoring

------------------------------------------------------------------------

# 17. Planning Approval Workflow

``` text
Engineering

↓

Project Manager

↓

Commercial Review

↓

Project Owner Approval

↓

Planning Baseline Locked
```

------------------------------------------------------------------------

# 18. Planning Baseline Lock

Setelah approved:

``` text
PLANNING BASELINE

LOCKED
```

Data menjadi referensi resmi untuk:

-   Survey.
-   Change analysis.
-   Financial comparison.

------------------------------------------------------------------------

# 19. Success Criteria

Module berhasil apabila:

-   BOQ indikatif tersedia.
-   Material terdefinisi.
-   Route tersedia.
-   Catuan tersedia.
-   Commercial value tersedia.
-   Margin simulation tersedia.
