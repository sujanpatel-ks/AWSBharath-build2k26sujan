"""
AgroCare AI — Auth Unit Tests
"""

from __future__ import annotations

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from shared.auth import AuthError, farmer_pk, get_farmer_id, get_farmer_email
from tests.fixtures.sample_events import FARMER_ID, api_event, unauthenticated_event


class TestGetFarmerId:
    @pytest.mark.unit
    @pytest.mark.auth
    def test_extracts_sub_from_valid_event(self):
        event = api_event()
        farmer_id = get_farmer_id(event)
        assert farmer_id == FARMER_ID

    @pytest.mark.unit
    @pytest.mark.auth
    def test_raises_auth_error_no_authorizer(self):
        event = unauthenticated_event()
        with pytest.raises(AuthError):
            get_farmer_id(event)

    @pytest.mark.unit
    @pytest.mark.auth
    def test_raises_auth_error_missing_sub(self):
        event = api_event()
        # Remove sub from claims
        event["requestContext"]["authorizer"]["claims"].pop("sub")
        with pytest.raises(AuthError):
            get_farmer_id(event)

    @pytest.mark.unit
    @pytest.mark.auth
    def test_raises_auth_error_empty_sub(self):
        event = api_event()
        event["requestContext"]["authorizer"]["claims"]["sub"] = ""
        with pytest.raises(AuthError):
            get_farmer_id(event)

    @pytest.mark.unit
    @pytest.mark.auth
    def test_different_farmer_ids_are_different(self):
        event_a = api_event(farmer_id="farmer-aaa")
        event_b = api_event(farmer_id="farmer-bbb")
        assert get_farmer_id(event_a) != get_farmer_id(event_b)


class TestFarmerPK:
    @pytest.mark.unit
    def test_pk_format(self):
        pk = farmer_pk("abc123")
        assert pk == "FARMER#abc123"

    @pytest.mark.unit
    def test_pk_contains_farmer_id(self):
        fid = "unique-farmer-sub"
        assert fid in farmer_pk(fid)


class TestGetFarmerEmail:
    @pytest.mark.unit
    def test_extracts_email(self):
        event = api_event()
        email = get_farmer_email(event)
        assert email == "farmer@example.com"

    @pytest.mark.unit
    def test_returns_none_no_authorizer(self):
        event = unauthenticated_event()
        email = get_farmer_email(event)
        assert email is None
