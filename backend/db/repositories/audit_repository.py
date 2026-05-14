from typing import Any

import db.json_store as store


class AuditRepository:
    def append(self, row: dict[str, Any]) -> None:
        store.insert("audit_logs", row)
