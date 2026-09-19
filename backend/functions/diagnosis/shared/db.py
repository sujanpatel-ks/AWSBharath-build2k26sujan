from __future__ import annotations

import os
from decimal import Decimal
from typing import Any

import boto3
from botocore.exceptions import ClientError

from .logger import get_logger

log = get_logger("db")

_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
_TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "AgroCare-Main-dev")

_dynamodb = boto3.resource("dynamodb", region_name=_REGION)
_table = _dynamodb.Table(_TABLE_NAME)


class DBError(Exception):
    """Raised on DynamoDB operations failures."""


def _convert_floats(obj: Any) -> Any:
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _convert_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_floats(v) for v in obj]
    return obj


def get_item(pk: str, sk: str) -> dict | None:
    try:
        response = _table.get_item(Key={"PK": pk, "SK": sk})
        return response.get("Item")
    except ClientError as exc:
        log.error("db_get_item_failed", exc=exc, pk=pk, sk=sk)
        raise DBError(f"Failed to get item: {exc.response['Error']['Message']}") from exc


def put_item(item: dict[str, Any]) -> None:
    try:
        converted = _convert_floats(item)
        _table.put_item(Item=converted)
    except ClientError as exc:
        log.error("db_put_item_failed", exc=exc, pk=item.get("PK"), sk=item.get("SK"))
        raise DBError(f"Failed to put item: {exc.response['Error']['Message']}") from exc


def update_item(pk: str, sk: str, updates: dict[str, Any]) -> dict[str, Any]:
    if not updates:
        return {}
    expr_parts = []
    expr_names: dict[str, str] = {}
    expr_values: dict[str, Any] = {}

    for i, (key, val) in enumerate(updates.items()):
        placeholder_name = f"#attr{i}"
        placeholder_val = f":val{i}"
        expr_parts.append(f"{placeholder_name} = {placeholder_val}")
        expr_names[placeholder_name] = key
        expr_values[placeholder_val] = _convert_floats(val)

    try:
        response = _table.update_item(
            Key={"PK": pk, "SK": sk},
            UpdateExpression="SET " + ", ".join(expr_parts),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues="ALL_NEW",
        )
        return response.get("Attributes", {})
    except ClientError as exc:
        log.error("db_update_item_failed", exc=exc, pk=pk, sk=sk)
        raise DBError(f"Failed to update item: {exc.response['Error']['Message']}") from exc


def query_by_pk(pk: str, sk_prefix: str | None = None, limit: int = 50,
                exclusive_start_key: dict | None = None) -> tuple[list[dict], dict | None]:
    try:
        kwargs: dict[str, Any] = {
            "KeyConditionExpression": boto3.dynamodb.conditions.Key("PK").eq(pk),
            "Limit": limit,
            "ScanIndexForward": False,
        }
        if sk_prefix:
            kwargs["KeyConditionExpression"] &= boto3.dynamodb.conditions.Key("SK").begins_with(sk_prefix)
        if exclusive_start_key:
            kwargs["ExclusiveStartKey"] = exclusive_start_key

        response = _table.query(**kwargs)
        return response.get("Items", []), response.get("LastEvaluatedKey")
    except ClientError as exc:
        log.error("db_query_failed", exc=exc, pk=pk)
        raise DBError(f"Failed to query items: {exc.response['Error']['Message']}") from exc


def query_gsi_farmer_history(farmer_id: str, limit: int = 20,
                             exclusive_start_key: dict | None = None) -> tuple[list[dict], dict | None]:
    try:
        kwargs: dict[str, Any] = {
            "IndexName": "farmerId-createdAt-index",
            "KeyConditionExpression": boto3.dynamodb.conditions.Key("farmerId").eq(farmer_id),
            "Limit": limit,
            "ScanIndexForward": False,
        }
        if exclusive_start_key:
            kwargs["ExclusiveStartKey"] = exclusive_start_key

        response = _table.query(**kwargs)
        return response.get("Items", []), response.get("LastEvaluatedKey")
    except ClientError as exc:
        log.error("db_query_gsi_failed", exc=exc, farmer_id=farmer_id)
        raise DBError(f"Failed to query farmer history: {exc.response['Error']['Message']}") from exc
