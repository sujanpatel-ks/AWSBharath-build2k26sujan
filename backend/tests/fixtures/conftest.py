"""
Shared pytest fixtures for AgroCare AI backend tests.
Uses moto to mock AWS services — no real AWS calls in unit tests.
"""

from __future__ import annotations

import json
import os
import sys

import boto3
import pytest

# Ensure shared and functions packages are importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

# Set test environment variables BEFORE any imports that read them
os.environ.setdefault("AWS_DEFAULT_REGION", "ap-south-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_SECURITY_TOKEN", "testing")
os.environ.setdefault("AWS_SESSION_TOKEN", "testing")
os.environ.setdefault("DYNAMODB_TABLE", "AgroCare-Main-test")
os.environ.setdefault("S3_IMAGES_BUCKET", "agrocare-test-images")
os.environ.setdefault("HAIKU_MODEL_ID", "global.anthropic.claude-haiku-4-5-20251001-v1:0")
os.environ.setdefault("SONNET_MODEL_ID", "anthropic.claude-sonnet-4-6")
os.environ.setdefault("KNOWLEDGE_BASE_ID", "test-kb-id-12345")
os.environ.setdefault("WEATHER_API_KEY_PARAM", "/agrocare/weather-api-key")


# ------------------------------------------------------------------
# Mock Lambda context
# ------------------------------------------------------------------
class MockLambdaContext:
    aws_request_id = "test-request-id-abcdef"
    function_name = "agrocare-test"
    memory_limit_in_mb = 512
    remaining_time_in_millis = lambda self: 30000  # noqa


@pytest.fixture
def lambda_context():
    return MockLambdaContext()


# ------------------------------------------------------------------
# Moto DynamoDB fixture
# ------------------------------------------------------------------
@pytest.fixture
def dynamodb_table():
    """Create a local moto DynamoDB table matching production schema."""
    from moto import mock_aws

    with mock_aws():
        client = boto3.resource("dynamodb", region_name="ap-south-1")
        table = client.create_table(
            TableName="AgroCare-Main-test",
            BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "farmerId", "AttributeType": "S"},
                {"AttributeName": "createdAt", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "farmerId-createdAt-index",
                    "KeySchema": [
                        {"AttributeName": "farmerId", "KeyType": "HASH"},
                        {"AttributeName": "createdAt", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
        )
        table.wait_until_exists()
        yield table


# ------------------------------------------------------------------
# Moto S3 fixture
# ------------------------------------------------------------------
@pytest.fixture
def s3_bucket():
    """Create a local moto S3 bucket."""
    from moto import mock_aws

    with mock_aws():
        client = boto3.client("s3", region_name="ap-south-1")
        client.create_bucket(
            Bucket="agrocare-test-images",
            CreateBucketConfiguration={"LocationConstraint": "ap-south-1"},
        )
        yield client


# ------------------------------------------------------------------
# Moto SSM fixture
# ------------------------------------------------------------------
@pytest.fixture
def ssm_with_weather_key():
    """Put a fake weather API key into SSM."""
    from moto import mock_aws

    with mock_aws():
        client = boto3.client("ssm", region_name="ap-south-1")
        client.put_parameter(
            Name="/agrocare/weather-api-key",
            Value="test-weather-api-key-12345",
            Type="SecureString",
            Overwrite=True,
        )
        yield client
