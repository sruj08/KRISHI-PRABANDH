from typing import Optional
from app.db.client import supabase

class SahayakRepository:
    
    @staticmethod
    def get_all(mandal_id: Optional[str] = None) -> list[dict]:
        query = supabase.table("sahayaks").select("*")
        if mandal_id:
            query = query.eq("mandal_id", mandal_id)
        res = query.execute()
        return res.data
        
    @staticmethod
    def get_by_id(sahayak_id: str) -> Optional[dict]:
        res = supabase.table("sahayaks").select("*").eq("sahayak_id", sahayak_id).limit(1).execute()
        return res.data[0] if res.data else None
        
    @staticmethod
    def get_by_mandal(mandal_id: str) -> list[dict]:
        res = supabase.table("sahayaks").select("*").eq("mandal_id", mandal_id).execute()
        return res.data
