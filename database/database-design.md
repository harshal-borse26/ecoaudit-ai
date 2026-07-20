# EcoAudit AI Database Design

## Overview

This document defines the database structure for the EcoAudit AI platform.

The goal is to keep the database:

- Scalable
- Secure
- Easy to maintain
- Easy to extend

The database follows relational database principles and is designed for MySQL (Amazon RDS).

## Business Requirements

A company can register on the platform.

A company can have multiple facilities.

Each facility can upload multiple utility bills.

Each uploaded bill is processed by AI.

The extracted information is stored separately.

Carbon emissions are calculated from the extracted data.

Users can generate reports for a company or a facility.

## Main Entities

1. Companies
2. Users
3. Facilities
4. Utility Bills
5. Bill Extractions
6. Carbon Emissions
7. Reports


## Relationships

Company
│
├── Users

├── Facilities
│
│   ├── Utility Bills
│   │
│   ├── Bill Extractions
│   │
│   └── Carbon Emissions
│
└── Reports