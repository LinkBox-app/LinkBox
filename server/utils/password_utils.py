import base64
import hashlib
import hmac
import secrets


PBKDF2_ALGORITHM = "sha256"
PBKDF2_ITERATIONS = 200_000
SALT_BYTES = 16


def hash_password(password: str) -> str:
    """使用 PBKDF2 对密码进行哈希。"""
    salt = secrets.token_bytes(SALT_BYTES)
    derived_key = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM, password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    hash_b64 = base64.b64encode(derived_key).decode("utf-8")
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${salt_b64}${hash_b64}"


def is_hashed_password(value: str) -> bool:
    return isinstance(value, str) and value.startswith(f"pbkdf2_{PBKDF2_ALGORITHM}$")


def verify_password(password: str, stored_value: str) -> bool:
    """验证密码；对历史明文密码返回 False（由调用方决定兼容策略）。"""
    if not is_hashed_password(stored_value):
        return False

    try:
        algorithm, iterations_str, salt_b64, hash_b64 = stored_value.split("$", 3)
        if algorithm != f"pbkdf2_{PBKDF2_ALGORITHM}":
            return False

        iterations = int(iterations_str)
        salt = base64.b64decode(salt_b64.encode("utf-8"))
        expected_hash = base64.b64decode(hash_b64.encode("utf-8"))
        actual_hash = hashlib.pbkdf2_hmac(
            PBKDF2_ALGORITHM, password.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False
