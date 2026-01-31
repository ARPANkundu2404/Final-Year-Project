# 🚀 Deployment Checklist - Stripe Payment Integration

## Pre-Deployment Setup

### 1. Local Testing (⏱️ 30 minutes)

- [ ] Clone repository and install dependencies
  ```bash
  npm install
  ```

- [ ] Create `.env.local` file
  ```env
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  MONGODB_URI=mongodb://... (optional)
  ```

- [ ] Start development server
  ```bash
  npm run dev
  ```

- [ ] Test payment flow with test card
  - [ ] Navigate to booking
  - [ ] Click "Complete Payment"
  - [ ] Use card: `4242 4242 4242 4242`
  - [ ] Complete payment
  - [ ] Verify QR code displays

- [ ] Test error scenarios
  - [ ] Use declined card: `4000 0000 0000 0002`
  - [ ] Verify error message displays
  - [ ] Verify user can retry

- [ ] Test on mobile (Chrome DevTools)
  - [ ] Check responsive design
  - [ ] Verify touch interactions work
  - [ ] Check orientation changes

### 2. Code Review (⏱️ 15 minutes)

- [ ] Review `/app/api/create-payment-intent/route.ts`
  - [ ] PaymentIntent creation logic
  - [ ] Error handling
  - [ ] Authentication checks

- [ ] Review `/app/api/payments/route.ts`
  - [ ] Payment confirmation logic
  - [ ] Booking status updates
  - [ ] QR code generation

- [ ] Review `/components/checkout-form.tsx`
  - [ ] PaymentElement usage
  - [ ] Error handling
  - [ ] User feedback

- [ ] Review `/components/stripe-provider.tsx`
  - [ ] Stripe configuration
  - [ ] Theme settings

- [ ] Review updated `/package.json`
  - [ ] Stripe packages included
  - [ ] Dependencies correct

### 3. Environment Setup (⏱️ 10 minutes)

- [ ] Verify all environment variables are set
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✓
  - [ ] `STRIPE_SECRET_KEY` ✓
  - [ ] `MONGODB_URI` (if using MongoDB) ✓

- [ ] Check `.env.local` is NOT committed to git
  - [ ] Add to `.gitignore` if needed
  - [ ] Verify with `git status`

- [ ] Verify environment variables in Vercel
  - [ ] Go to Project Settings → Environment Variables
  - [ ] Add all required variables
  - [ ] Redeploy after adding variables

## Deployment Steps

### 4. Deploy to Production (⏱️ 20 minutes)

- [ ] Ensure all code is committed
  ```bash
  git add .
  git commit -m "Add Stripe payment integration"
  ```

- [ ] Push to main branch
  ```bash
  git push origin main
  ```

- [ ] Verify deployment in Vercel
  - [ ] Check build logs
  - [ ] Verify no build errors
  - [ ] Check deployment preview

- [ ] Test deployed application
  - [ ] Open deployed URL
  - [ ] Create test booking
  - [ ] Attempt payment with test card
  - [ ] Verify success flow

### 5. Update to Live Keys (⏱️ 10 minutes)

- [ ] Get live Stripe keys
  - [ ] Go to https://dashboard.stripe.com (live mode)
  - [ ] Navigate to Developers → API Keys
  - [ ] Copy live keys (pk_live_*, sk_live_*)

- [ ] Update Vercel environment variables
  - [ ] Go to Project Settings → Environment Variables
  - [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
  - [ ] Update `STRIPE_SECRET_KEY` → `sk_live_...`
  - [ ] Redeploy project

- [ ] Verify live deployment
  - [ ] Check environment variables are updated
  - [ ] Verify application loads without errors

### 6. Post-Deployment Testing (⏱️ 25 minutes)

- [ ] Test payment with test card in production
  - [ ] Use test card: `4242 4242 4242 4242`
  - [ ] Complete payment
  - [ ] Verify QR code generation
  - [ ] Check Stripe dashboard for transaction

- [ ] Test error scenarios in production
  - [ ] Use declined card: `4000 0000 0000 0002`
  - [ ] Verify error handling
  - [ ] Check logs for errors

- [ ] Monitor Stripe dashboard
  - [ ] Check for successful payments
  - [ ] Verify payment metadata
  - [ ] Look for any declined payments

- [ ] Test database updates
  - [ ] Verify booking status updated to "confirmed"
  - [ ] Check QR code was generated
  - [ ] Verify parking slot marked as "booked"

## Monitoring & Maintenance

### 7. Set Up Monitoring (⏱️ 30 minutes)

- [ ] Enable Stripe event notifications
  - [ ] Go to Stripe Dashboard → Webhooks
  - [ ] Add endpoint: `https://your-domain.com/api/webhooks/stripe`
  - [ ] Subscribe to events:
    - [ ] `payment_intent.succeeded`
    - [ ] `payment_intent.payment_failed`

- [ ] Set up error logging
  - [ ] Configure Sentry (optional)
  - [ ] Set up log aggregation (optional)
  - [ ] Configure alerts for errors

- [ ] Monitor application metrics
  - [ ] Set up Vercel Analytics
  - [ ] Monitor API response times
  - [ ] Track error rates

- [ ] Configure Stripe notifications
  - [ ] Email alerts for failed payments
  - [ ] Dashboard monitoring
  - [ ] Revenue tracking

### 8. Documentation & Team Training (⏱️ 20 minutes)

- [ ] Update team documentation
  - [ ] Share deployment guide
  - [ ] Document Stripe setup
  - [ ] Update API documentation

- [ ] Train support team
  - [ ] Payment troubleshooting guide
  - [ ] Customer refund process
  - [ ] Issue escalation procedures

- [ ] Create runbooks
  - [ ] Payment failure response
  - [ ] QR code issues
  - [ ] Booking not updated scenarios

## Ongoing Maintenance

### 9. Regular Checks (Daily)

- [ ] Monitor Stripe dashboard
  - [ ] Check for failed payments
  - [ ] Review transaction volume
  - [ ] Look for unusual patterns

- [ ] Check application logs
  - [ ] Look for errors
  - [ ] Monitor API response times
  - [ ] Track user issues

- [ ] Verify system health
  - [ ] Database connectivity
  - [ ] API endpoint availability
  - [ ] Third-party service status

### 10. Weekly Checks

- [ ] Review payment metrics
  - [ ] Total transactions
  - [ ] Success rate
  - [ ] Average transaction value
  - [ ] Failed payment reasons

- [ ] Check for updates
  - [ ] Stripe SDK updates
  - [ ] Security patches
  - [ ] Dependency updates

- [ ] Test payment flow
  - [ ] Ensure system working
  - [ ] Verify QR codes generating
  - [ ] Check error handling

### 11. Monthly Maintenance

- [ ] Review Stripe reports
  - [ ] Revenue trends
  - [ ] Customer payment patterns
  - [ ] Fraud detection alerts

- [ ] Update documentation
  - [ ] Document any changes
  - [ ] Update troubleshooting guide
  - [ ] Refine processes

- [ ] Security review
  - [ ] Check for vulnerabilities
  - [ ] Review access logs
  - [ ] Update security policies

## Troubleshooting Guide

### Issue: "Stripe keys not found"
- [ ] Check environment variables in Vercel
- [ ] Verify keys are correct format (pk_*, sk_*)
- [ ] Redeploy after adding variables
- [ ] Check browser console for errors

### Issue: "Payment processes but booking not updated"
- [ ] Check database connection
- [ ] Review server logs
- [ ] Verify API endpoint is accessible
- [ ] Check for database errors

### Issue: "QR code not displaying"
- [ ] Verify booking status is "confirmed"
- [ ] Check QR code data is being generated
- [ ] Review browser console for rendering errors
- [ ] Test with different booking

### Issue: "CORS errors"
- [ ] Verify Stripe domain in headers
- [ ] Check browser console for specific error
- [ ] Update CORS configuration if needed
- [ ] Contact Stripe support if persistent

### Issue: "Failed payments increasing"
- [ ] Check Stripe fraud detection settings
- [ ] Review failed payment reasons in dashboard
- [ ] Consider updating payment method
- [ ] Contact Stripe support for analysis

## Rollback Plan

If issues occur:

1. **Immediate Action** (if critical)
   - [ ] Disable payment processing
   - [ ] Redirect to manual payment page
   - [ ] Notify users

2. **Revert Code** (if code issue)
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Revert Environment** (if configuration issue)
   - [ ] Restore previous environment variables
   - [ ] Redeploy
   - [ ] Verify application works

4. **Contact Stripe** (if Stripe issue)
   - [ ] Check Stripe status page
   - [ ] Contact support
   - [ ] Provide error details

## Success Criteria

- ✅ Payment page loads without errors
- ✅ PaymentElement displays correctly
- ✅ Test payments succeed
- ✅ QR codes generate automatically
- ✅ Booking status updates to "confirmed"
- ✅ Parking slot marked as "booked"
- ✅ Error handling works for failed payments
- ✅ Mobile responsive design works
- ✅ No sensitive data in logs
- ✅ Monitoring alerts configured

## Sign-Off Checklist

| Item | Date | Signed By |
|------|------|-----------|
| Development complete | ___ | ___ |
| Testing complete | ___ | ___ |
| Code review passed | ___ | ___ |
| Production deployment | ___ | ___ |
| Live testing passed | ___ | ___ |
| Monitoring configured | ___ | ___ |
| Team trained | ___ | ___ |
| Documentation updated | ___ | ___ |

## Contact Information

### Support Contacts
- **Stripe Support**: https://support.stripe.com
- **Vercel Support**: https://vercel.com/help
- **Development Team**: [contact info]
- **On-Call Engineer**: [contact info]

### Escalation Path
1. Developer → Team Lead (if unresolved)
2. Team Lead → Project Manager (if urgent)
3. Project Manager → Stripe Support (if Stripe issue)

---

## 📋 Quick Reference

### Environment Variables Needed
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Key Files
- `/app/api/create-payment-intent/route.ts` - PaymentIntent creation
- `/app/api/payments/route.ts` - Payment confirmation
- `/components/checkout-form.tsx` - Checkout UI
- `/components/stripe-provider.tsx` - Stripe setup

### Important URLs
- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard
- API Documentation: https://stripe.com/docs/api
- Stripe Test Cards: https://stripe.com/docs/testing

### Test Cards (for testing only)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

**Deployment Checklist Version**: 1.0  
**Last Updated**: January 31, 2026  
**Status**: Ready for Production

For detailed setup instructions, see `/QUICK_START.md`
