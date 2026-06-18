-- ============================================================
-- Database Verification: EngageAds — View Package
-- Generated: 2026-06-18 | Pipeline: Step 3 (Database Verification)
--
-- Source: repo-analysis.md for /EngageAds/BundledAdPackages
-- Purpose:
--   1. Verify CreatePayment persisted an order record.
--   2. Verify SubmitInquiry persisted a CUSTOM_PACKAGE inquiry.
--   3. Verify Stripe-backed checkout stored payment_intent_id on the order.
--
-- IMPORTANT:
--   Replace table names below if your schema uses different names.
--   Column names are derived from the documented handler contracts and may
--   need small adjustments per environment.
-- ============================================================

DECLARE @OrderNumber        NVARCHAR(100) = N'';   -- order / confirmation number from UI
DECLARE @OrderSeq           BIGINT        = 0;     -- internal order key when known
DECLARE @InquiryNumber      NVARCHAR(100) = N'';   -- inquiry number returned by SubmitInquiry
DECLARE @ContractorId       NVARCHAR(100) = N'';   -- dealer number / contractor id
DECLARE @PaymentIntentId    NVARCHAR(200) = N'';   -- Stripe payment intent from downstream payment flow
DECLARE @ExpectedPackage    NVARCHAR(200) = N'Local Lead Starter';
DECLARE @ExpectedInquiry    NVARCHAR(50)  = N'CUSTOM_PACKAGE';
DECLARE @ExpectedTeam       NVARCHAR(50)  = N'DIGITAL_FUSION';

PRINT '============================================================';
PRINT 'EngageAds View Package — DB Verification';
PRINT 'Run Date: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================';

-- ============================================================
-- 1. CreatePayment / OrderConfirmation verification
-- ============================================================
-- Expected after ?handler=CreatePayment:
--   - order header exists
--   - package line item exists
--   - card_amount = 0 for co-op-only flow
--   - coop_amount reflects the approved co-op total

SELECT
    o.order_seq,
    o.order_number,
    o.order_status,
    o.package_name,
    o.total_amount,
    o.card_amount,
    o.coop_amount,
    o.transaction_fee,
    o.payment_intent_id,
    o.created_date,
    o.created_by
FROM dbo.engage_ads_order o
WHERE (@OrderSeq > 0 AND o.order_seq = @OrderSeq)
   OR (@OrderNumber <> N'' AND o.order_number = @OrderNumber)
ORDER BY o.created_date DESC;
-- EXPECTED:
--   - one row returned
--   - package_name = @ExpectedPackage
--   - order_status is an active/created state
--   - card_amount = 0.00 for CreatePayment flow
--   - coop_amount > 0

SELECT
    oi.order_item_seq,
    oi.order_seq,
    oi.item_name,
    oi.quantity,
    oi.unit_amount,
    oi.line_total
FROM dbo.engage_ads_order_item oi
WHERE oi.order_seq = @OrderSeq
ORDER BY oi.order_item_seq;
-- EXPECTED:
--   - one line item for the selected package
--   - unit_amount aligns with the package price

-- ============================================================
-- 2. SubmitInquiry verification
-- ============================================================
-- Expected after ?handler=SubmitInquiry:
--   - inquiry exists with InquiryTypeCode = CUSTOM_PACKAGE
--   - assigned team is DIGITAL_FUSION
--   - source page points to /EngageAds/BundledAdPackages

SELECT
    i.inquiry_seq,
    i.inquiry_number,
    i.inquiry_type_code,
    i.inquiry_status_code,
    i.assigned_team_code,
    i.assigned_to,
    i.contractor_id,
    i.contractor_name,
    i.contact_name,
    i.contact_email,
    i.source_page,
    i.city,
    i.state_seq,
    i.monthly_budget,
    i.additional_notes,
    i.created_date
FROM dbo.engage_ads_inquiry i
WHERE (@InquiryNumber <> N'' AND i.inquiry_number = @InquiryNumber)
   OR (@ContractorId <> N'' AND i.contractor_id = @ContractorId AND i.inquiry_type_code = @ExpectedInquiry)
ORDER BY i.created_date DESC;
-- EXPECTED:
--   - inquiry_type_code = CUSTOM_PACKAGE
--   - assigned_team_code = DIGITAL_FUSION
--   - source_page = /EngageAds/BundledAdPackages

-- ============================================================
-- 3. Stripe payment linkage verification
-- ============================================================
-- Expected after CreateStripeSession -> /EngageAds/Payment -> payment completion:
--   - order header exists
--   - payment_intent_id is persisted
--   - card amount and fee are greater than zero

SELECT
    o.order_seq,
    o.order_number,
    o.order_status,
    o.card_amount,
    o.coop_amount,
    o.transaction_fee,
    o.payment_intent_id,
    o.modified_date
FROM dbo.engage_ads_order o
WHERE (@PaymentIntentId <> N'' AND o.payment_intent_id = @PaymentIntentId)
   OR (@OrderSeq > 0 AND o.order_seq = @OrderSeq)
ORDER BY o.modified_date DESC;
-- EXPECTED:
--   - payment_intent_id populated for Stripe-backed orders
--   - card_amount > 0
--   - transaction_fee > 0

SELECT
    p.payment_seq,
    p.order_seq,
    p.payment_intent_id,
    p.amount,
    p.currency_code,
    p.payment_status,
    p.created_date
FROM dbo.engage_ads_payment p
WHERE (@PaymentIntentId <> N'' AND p.payment_intent_id = @PaymentIntentId)
   OR (@OrderSeq > 0 AND p.order_seq = @OrderSeq)
ORDER BY p.created_date DESC;
-- EXPECTED:
--   - payment record exists for the completed Stripe order
--   - amount matches the card charge total including fee
