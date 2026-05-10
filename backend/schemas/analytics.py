from typing import Any, Optional

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    surveys_total: int = 0
    surveys_pending_approval: int = 0
    surveys_compensated: int = 0
    farms_under_survey: int = 0
    extra: Optional[dict[str, Any]] = None
