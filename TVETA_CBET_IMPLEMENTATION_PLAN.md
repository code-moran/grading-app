# TVETA/CBET Compliance Implementation Plan

## Overview
This document outlines the changes needed to make the grading system compliant with TVETA (Technical and Vocational Education and Training Authority) guidelines and CBET (Competency-Based Education and Training) logic.

## Key Requirements

### 1. Competency-Based Assessment
- Assessments must be competency-based (competent/not competent per unit)
- Link assessments to unit standards
- Track competency status separately from numeric grades

### 2. Unit Standards & KNQF Alignment
- Courses must align to unit standards
- Track KNQF (Kenya National Qualifications Framework) levels
- Link lessons/exercises to competency units

### 3. Assessor/Trainer Credentials
- Track assessor accreditation and licensing
- Validate assessor credentials before allowing assessments
- Store accreditation expiry dates

### 4. Audit & Compliance
- Log all assessment actions
- Track who assessed, verified, and moderated
- Version control for standards and curricula

## Implementation Steps

### Phase 1: Database Schema Updates ✅ (In Progress)
- [x] Remove unused features (test pages, GradingSession model)
- [ ] Add UnitStandard model
- [ ] Add CompetencyUnit model  
- [ ] Add AssessorAccreditation model
- [ ] Add AssessmentAuditLog model
- [ ] Update Course model (add KNQF level)
- [ ] Update Exercise model (link to competency units)
- [ ] Update Grade model (add competency status)
- [ ] Update Instructor model (assessor credentials)

### Phase 2: Backend Logic Updates
- [ ] Update assessment logic to be competency-based
- [ ] Add competency validation
- [ ] Update export functionality
- [ ] Add audit logging

### Phase 3: UI/UX Updates
- [ ] Update terminology (competency, unit standard, assessment)
- [ ] Add competency status indicators
- [ ] Add help text and tooltips
- [ ] Update filters and exports

### Phase 4: Cleanup & Documentation
- [ ] Remove deprecated code
- [ ] Update documentation
- [ ] Add user guides

## Terminology Changes
- "Grade" → "Assessment" (when referring to competency)
- "Exercise" → "Competency Unit" (when aligned to standards)
- "Instructor" → "Assessor/Trainer" (when assessing)
- Add "Competent/Not Competent" alongside percentage grades
