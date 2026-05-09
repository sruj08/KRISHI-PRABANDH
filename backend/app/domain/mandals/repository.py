from typing import Optional
from app.db.client import supabase

class MandalRepository:
    
    @staticmethod
    def get_all() -> list[dict]:
        res = supabase.table("mandals").select("*").execute()
        return res.data
        
    @staticmethod
    def get_by_id(mandal_id: str) -> Optional[dict]:
        res = supabase.table("mandals").select("*").eq("mandal_id", mandal_id).limit(1).execute()
        return res.data[0] if res.data else None
