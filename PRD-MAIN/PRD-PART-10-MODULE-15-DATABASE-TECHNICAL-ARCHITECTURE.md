# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Fiber Optic Project Lifecycle & Profitability Management Platform (FOPLP)

# PART 10 --- DATABASE & TECHNICAL ARCHITECTURE

## MODULE 15 --- DATABASE DESIGN & TECHNICAL ARCHITECTURE

------------------------------------------------------------------------

# 1. Module Overview

## 1.1 Objective

Database & Technical Architecture Module mendefinisikan struktur
teknologi yang menjadi fondasi aplikasi FOPLP.

Tujuan:

-   Menyediakan struktur data terintegrasi.
-   Mendukung seluruh lifecycle proyek.
-   Menjamin scalability.
-   Mendukung GIS dan document management.
-   Menyediakan integrasi API.

------------------------------------------------------------------------

# 2. Database Design Principle

Prinsip utama:

## Single Source of Truth

Seluruh data proyek berada pada database terpusat.

------------------------------------------------------------------------

## Traceability

Setiap perubahan memiliki histori.

------------------------------------------------------------------------

## Relationship Based Data

Seluruh modul memiliki relasi terhadap Project.

------------------------------------------------------------------------

# 3. High Level Entity Relationship

``` text
PROJECT

|

+-- BOQ

|

+-- ROUTE

|

+-- SURVEY

|

+-- DRM

|

+-- IMPLEMENTATION

|

+-- EVIDENCE

|

+-- TEST RESULT

|

+-- FINANCIAL

|

+-- HANDOVER

|

+-- AUDIT LOG
```

------------------------------------------------------------------------

# 4. Core Database Entity

# ENTITY 1 --- PROJECT

## Purpose

Master data seluruh proyek.

Table:

projects

  Field
  --------------------
  project_id
  project_code
  project_name
  customer_id
  project_type
  location
  start_date
  target_finish_date
  status
  project_manager
  created_date

------------------------------------------------------------------------

# ENTITY 2 --- CUSTOMER

Purpose:

Menyimpan informasi client.

Table:

customers

  Field
  ----------------
  customer_id
  customer_name
  company
  contact_person
  email
  phone

------------------------------------------------------------------------

# ENTITY 3 --- USER

Table:

users

  Field
  ------------
  user_id
  name
  email
  role_id
  department
  status

------------------------------------------------------------------------

# ENTITY 4 --- ROLE

Table:

roles

  Field
  ------------
  role_id
  role_name
  permission

------------------------------------------------------------------------

# ENTITY 5 --- BOQ

Purpose:

Menyimpan seluruh item pekerjaan.

Table:

boq_header

  Field
  -----------------
  boq_id
  project_id
  version
  status
  created_by
  approval_status

Table:

boq_detail

  Field
  ------------------
  boq_detail_id
  boq_id
  item_id
  quantity
  unit
  location_segment
  remark

------------------------------------------------------------------------

# ENTITY 6 --- ITEM MASTER

Purpose:

Database material dan pekerjaan.

Table:

items

  Field
  ---------------
  item_id
  category
  item_name
  specification
  unit

------------------------------------------------------------------------

# ENTITY 7 --- COMMERCIAL BOQ

Purpose:

Mengelola harga jual dan biaya.

Table:

commercial_boq

  Field
  -------------------
  boq_detail_id
  internal_cost
  selling_price
  revenue
  profit
  margin_percentage

------------------------------------------------------------------------

# ENTITY 8 --- ROUTE

Purpose:

Menyimpan jalur Fiber Optic.

Table:

routes

  Field
  ----------------
  route_id
  project_id
  version
  source
  destination
  total_distance
  kml_file

------------------------------------------------------------------------

# ENTITY 9 --- ROUTE SEGMENT

Table:

route_segments

  Field
  ---------------------
  segment_id
  route_id
  start_point
  end_point
  distance
  cable_type
  installation_method
  status

------------------------------------------------------------------------

# ENTITY 10 --- FIBER ALLOCATION

Purpose:

Menyimpan catuan.

Table:

fiber_allocations

  Field
  ---------------
  allocation_id
  segment_id
  core_number
  source
  destination
  usage
  status

------------------------------------------------------------------------

# ENTITY 11 --- SURVEY

Table:

surveys

  Field
  -------------
  survey_id
  project_id
  survey_date
  surveyor
  status

------------------------------------------------------------------------

# ENTITY 12 --- SURVEY RESULT

Table:

survey_results

  Field
  ---------------
  result_id
  survey_id
  segment_id
  planned_value
  actual_value
  deviation
  reason_code

------------------------------------------------------------------------

# ENTITY 13 --- PERMIT

Table:

permits

  Field
  ------------
  permit_id
  project_id
  authority
  area_type
  location
  status
  document

------------------------------------------------------------------------

# ENTITY 14 --- DRM

Table:

drm

  Field
  ------------
  drm_id
  project_id
  date
  status
  decision

------------------------------------------------------------------------

# ENTITY 15 --- CHANGE REQUEST

Table:

change_requests

  Field
  ------------------
  cr_id
  project_id
  description
  reason
  technical_impact
  cost_impact
  margin_impact
  approval_status

------------------------------------------------------------------------

# ENTITY 16 --- IMPLEMENTATION

Table:

implementation

  Field
  -------------------
  implementation_id
  project_id
  contractor
  start_date
  end_date
  status

------------------------------------------------------------------------

# ENTITY 17 --- CONSTRUCTION ACTIVITY

Table:

construction_activity

  Field
  -------------------
  activity_id
  implementation_id
  activity_type
  segment
  progress
  start_date
  finish_date

------------------------------------------------------------------------

# ENTITY 18 --- EVIDENCE

Table:

evidence

  Field
  ----------------
  evidence_id
  activity_id
  file_path
  file_type
  gps_coordinate
  timestamp
  uploaded_by

------------------------------------------------------------------------

# ENTITY 19 --- TEST RESULT

Table:

test_results

  Field
  ------------
  test_id
  project_id
  test_type
  fiber_id
  result
  document

------------------------------------------------------------------------

# ENTITY 20 --- FINANCIAL

Table:

project_financial

  Field
  ----------------
  project_id
  contract_value
  estimated_cost
  actual_cost
  profit
  margin

------------------------------------------------------------------------

# ENTITY 21 --- ASSET INVENTORY

Table:

assets

  Field
  ---------------
  asset_id
  project_id
  asset_type
  specification
  location
  status

------------------------------------------------------------------------

# ENTITY 22 --- HANDOVER

Table:

handover

  Field
  -------------
  handover_id
  project_id
  date
  customer
  status
  document

------------------------------------------------------------------------

# ENTITY 23 --- AUDIT LOG

Table:

audit_logs

  Field
  -----------
  audit_id
  user
  module
  action
  old_value
  new_value
  timestamp

------------------------------------------------------------------------

# 5. System Architecture

## 5.1 Architecture Overview

``` text
USER

|

WEB APPLICATION

|

API GATEWAY

|

BACKEND SERVICES

|

DATABASE

|

FILE STORAGE

|

GIS ENGINE
```

------------------------------------------------------------------------

# 6. Frontend Architecture

Recommended:

-   React.js.
-   Next.js.
-   Tailwind CSS.
-   Material UI.

Responsibility:

-   Dashboard.
-   Form input.
-   Workflow approval.
-   GIS visualization.
-   Reporting.

------------------------------------------------------------------------

# 7. Backend Architecture

Recommended:

-   Node.js + NestJS.

Service:

## Project Service

Mengelola:

-   Project.
-   User.
-   Workflow.

## Engineering Service

Mengelola:

-   BOQ.
-   Route.
-   Fiber allocation.

## Construction Service

Mengelola:

-   Progress.
-   Evidence.
-   Activity.

## Financial Service

Mengelola:

-   Revenue.
-   Cost.
-   Margin.

## Document Service

Mengelola:

-   Upload.
-   Versioning.
-   Archive.

------------------------------------------------------------------------

# 8. Database Technology

Recommended:

PostgreSQL

Dengan:

PostGIS Extension

Untuk:

-   Spatial data.
-   Route.
-   Coordinate.

------------------------------------------------------------------------

# 9. File Storage Architecture

Digunakan untuk:

-   Foto.
-   Video.
-   KML.
-   PDF.
-   Drawing.

Recommended:

-   AWS S3.
-   MinIO.
-   Azure Blob Storage.

------------------------------------------------------------------------

# 10. GIS Architecture

Mapping Engine:

-   Leaflet.js.
-   Mapbox.
-   Google Maps API.

Support:

-   Point.
-   Line.
-   Polygon.

------------------------------------------------------------------------

# 11. API Architecture

Style:

REST API

Contoh:

Project:

GET /api/projects

BOQ:

GET /api/projects/{id}/boq

Evidence:

POST /api/evidence/upload

GIS:

GET /api/projects/{id}/route

------------------------------------------------------------------------

# 12. Success Criteria

Module berhasil apabila:

-   Database mendukung seluruh lifecycle.
-   Data antar modul terintegrasi.
-   Sistem scalable.
-   API tersedia.
-   GIS dapat berjalan.
