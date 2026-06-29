import base64
import json
import hmac
import hashlib
import time

def base64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data):
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def encode_jwt(payload, secret_key):
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    message = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(secret_key.encode('utf-8'), message, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt(token, secret_key):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        message = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_signature = hmac.new(secret_key.encode('utf-8'), message, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        if not hmac.compare_digest(signature_b64, expected_signature_b64):
            return None
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if 'exp' in payload and payload['exp'] < time.time():
            return None
        return payload
    except Exception:
        return None
