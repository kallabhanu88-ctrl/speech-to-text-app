import sys, os
import io
import pytest
import uuid
from dotenv import load_dotenv

# 🧠 Ensure app.py can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app import app

load_dotenv()

# ------------------------------
# ✅ Test client fixture
# ------------------------------
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# ------------------------------
# ✅ Helper: register/login user with unique username
# ------------------------------
def register_and_login(client, username=None, password="testpass"):
    if username is None:
        username = f"testuser_{uuid.uuid4().hex[:8]}"
    # Register user
    r = client.post("/register", json={"username": username, "password": password})
    assert r.status_code in (200, 201)
    # Login user
    r = client.post("/login", json={"username": username, "password": password})
    assert r.status_code == 200
    return r.get_json()["token"], username

# ------------------------------
# ✅ Basic route tests
# ------------------------------
def test_home(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "Speech-to-Text API" in r.get_json().get("message", "")

def test_register_login(client):
    token, username = register_and_login(client)
    assert token is not None

def test_transcribe_no_token(client):
    data = {"file": (io.BytesIO(b"abc"), "test.webm")}
    r = client.post("/transcribe", content_type='multipart/form-data', data=data)
    assert r.status_code == 401

# ------------------------------
# ✅ Mock Whisper for faster tests
# ------------------------------
def fake_transcribe(path):
    return {"text": "hello from test"}

def test_transcribe_mocked(client, monkeypatch):
    # Use a unique username to avoid FK conflicts
    token, username = register_and_login(client)

    # Replace real transcription with fake
    monkeypatch.setattr("app.model.transcribe", fake_transcribe)

    # Tiny fake audio file
    data = {"file": (io.BytesIO(b"fakeaudio"), "test.webm")}
    r = client.post(
        "/transcribe",
        content_type='multipart/form-data',
        data=data,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert r.status_code == 200
    assert "hello from test" in r.get_json()["transcript"]
