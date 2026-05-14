from typing import Any, Optional

import db.json_store as store


class CompensationRepository:
    def get_by_survey(self, survey_id: str) -> Optional[dict[str, Any]]:
        return store.find_one("compensation_payments", survey_id=survey_id)
