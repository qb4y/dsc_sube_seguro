import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.shared.cache import TTLCache


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def cache():
    c = TTLCache(ttl_seconds=60)
    yield c
    c.clear()
