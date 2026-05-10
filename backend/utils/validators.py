"""Shared validation helpers."""

import re
from uuid import UUID


def parse_uuid(value: str, field: str = "id") -> UUID:
    try:
        return UUID(value)
    except ValueError as e:
        raise ValueError(f"Invalid {field}") from e


_SLUG = re.compile(r"^[a-zA-Z0-9_-]{1,128}$")


def assert_safe_identifier(value: str, field: str) -> str:
    if not _SLUG.match(value):
        raise ValueError(f"Invalid {field}")
    return value
