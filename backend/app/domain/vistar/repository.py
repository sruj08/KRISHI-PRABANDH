from typing import Optional
from app.db.client import supabase

class VistarRepository:
    @staticmethod
    def get_all(mandal_id: Optional[str] = None) -> list[dict]:
        query = supabase.table("vistar_sessions").select("*")
        if mandal_id:
            query = query.eq("mandal_id", mandal_id)
        res = query.execute()
        return res.data
