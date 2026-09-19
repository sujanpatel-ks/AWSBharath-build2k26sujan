# ============================================================
# AgroCare AI — Makefile
# ============================================================
.PHONY: help install build deploy test test-unit test-integration \
        upload-docs frontend-install frontend-dev frontend-build \
        lint clean validate logs

REGION        ?= ap-south-1
ENV           ?= dev
STACK_NAME    ?= agrocare-ai-$(ENV)
SAM_CONFIG    := infrastructure/samconfig.toml
SAM_TEMPLATE  := infrastructure/template.yaml

# ---- Help --------------------------------------------------
help:
	@echo "AgroCare AI — Make targets"
	@echo ""
	@echo "  install            Install all backend dependencies"
	@echo "  build              SAM build"
	@echo "  validate           SAM template validation + lint"
	@echo "  deploy             SAM deploy (dev)"
	@echo "  deploy-prod        SAM deploy (prod)"
	@echo "  test               Run all tests"
	@echo "  test-unit          Run unit tests only"
	@echo "  test-integration   Run integration tests (needs deployed stack)"
	@echo "  upload-docs        Upload seed documents to S3 KB bucket"
	@echo "  frontend-install   npm install for frontend"
	@echo "  frontend-dev       Start frontend dev server"
	@echo "  frontend-build     Build frontend for production"
	@echo "  lint               Lint Python + TypeScript"
	@echo "  clean              Remove build artifacts"
	@echo "  logs               Tail CloudWatch logs for diagnosis Lambda"

# ---- Backend -----------------------------------------------
install:
	pip install -r backend/requirements-dev.txt
	pip install -r backend/layer/requirements.txt

build:
	sam build \
		--template-file $(SAM_TEMPLATE) \
		--config-file $(SAM_CONFIG) \
		--parallel

validate:
	sam validate \
		--template-file $(SAM_TEMPLATE) \
		--region $(REGION) \
		--lint

deploy:
	sam deploy \
		--template-file $(SAM_TEMPLATE) \
		--config-file $(SAM_CONFIG) \
		--stack-name $(STACK_NAME) \
		--region $(REGION) \
		--config-env default

deploy-prod:
	sam deploy \
		--template-file $(SAM_TEMPLATE) \
		--config-file $(SAM_CONFIG) \
		--stack-name agrocare-ai-prod \
		--region $(REGION) \
		--config-env prod

# ---- Tests -------------------------------------------------
test: test-unit

test-unit:
	cd backend && python -m pytest tests/unit -v \
		--tb=short \
		-p no:warnings

test-integration:
	cd backend && python -m pytest tests/integration -v \
		--tb=short \
		-p no:warnings \
		-m integration

# ---- Knowledge Base documents ------------------------------
upload-docs:
	@echo "Uploading seed agricultural documents..."
	python infrastructure/scripts/upload_documents.py \
		--bucket-param /agrocare/agri-docs-bucket \
		--docs-dir documents/ \
		--region $(REGION)

# ---- Frontend ----------------------------------------------
frontend-install:
	cd frontend && npm install

frontend-dev:
	@echo "Start frontend manually: cd frontend && npm run dev"

frontend-build:
	cd frontend && npm run build

# ---- Quality -----------------------------------------------
lint:
	cd backend && python -m ruff check .
	cd frontend && npm run lint

# ---- Ops ---------------------------------------------------
clean:
	rm -rf .aws-sam/
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find backend -name "*.pyc" -delete 2>/dev/null; true
	rm -rf frontend/dist/

logs:
	aws logs tail /aws/lambda/agrocare-diagnosis-$(ENV) \
		--follow \
		--region $(REGION)
