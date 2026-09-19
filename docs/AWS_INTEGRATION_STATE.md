# AgroCare AWS Integration State

This file records verified integration work for the AWS-backed frontend and API.
It contains identifiers and endpoints only; no credentials or secrets are stored here.

## 2026-09-19 — Phase 1: live resource mapping

- Account: `570380297278`
- Region: `ap-south-1`
- CloudFormation stack: `agrocare-ai-dev` (`UPDATE_COMPLETE`)
- API Gateway stage: `https://cswuh02bdi.execute-api.ap-south-1.amazonaws.com/dev`
- Cognito user pool: `ap-south-1_ID0rVVP3m`
- Cognito app client: `66o85ou4840kptkt9kmibb10li`
- Crop image bucket: `agrocare-crop-images-dev-570380297278`
- DynamoDB table: `AgroCare-Main-dev`

Evidence source: `aws cloudformation describe-stacks --region ap-south-1 --stack-name agrocare-ai-dev`.

## 2026-09-19 — Phase 2: frontend AWS wiring

- Created ignored `frontend/.env.local` from the live CloudFormation outputs.
- Set `VITE_ENABLE_DEMO_MODE=false` so normal builds require Cognito and API Gateway.
- Kept demo data available only as an explicit local-preview mode when that variable is set to `true`.
- Added fail-closed client errors when the API Gateway URL is missing.

## 2026-09-19 — Phase 3: CORS preflight fix

- Updated `infrastructure/template.yaml` so API Gateway does not apply the Cognito default authorizer to CORS `OPTIONS` requests.
- Before the fix, the live `OPTIONS /weather` request returned `401 Unauthorized`.
- Ran `sam validate`, `sam build`, and `sam deploy` against `agrocare-ai-dev` in `ap-south-1`.
- CloudFormation completed with `UPDATE_COMPLETE`.
- After deployment, `OPTIONS /weather` returned `200` with `Access-Control-Allow-Origin: http://localhost:5173`, the configured methods, and the authorization headers.
- After deployment, an unauthenticated `GET /weather` returned the expected `401 Authentication required`, confirming the Cognito authorizer still protects application routes.

## Remaining live verification

- Deploy the SAM template update and confirm `OPTIONS` returns the configured CORS headers.
- Register/sign in with a real Cognito test user, then verify authenticated API calls.
- Bedrock model access remains an external account-level blocker already documented in `docs/DEPLOY_STATE.md` and `docs/PROD_TEST_STATE.md`.
