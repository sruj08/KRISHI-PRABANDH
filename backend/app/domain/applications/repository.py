from typing import Optional
from app.db.client import supabase

class ApplicationRepository:
    
    @staticmethod
    def get_all(
        status: Optional[str] = None,
        component: Optional[str] = None,
        scheme_category: Optional[str] = None,
        farmer_id: Optional[str] = None,
        sahayak_id: Optional[str] = None,
        mandal_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[dict]:
        query = supabase.table("applications").select("*")
        
        if status:
            query = query.ilike("status", f"%{status}%")
        if component:
            query = query.ilike("component", f"%{component}%")
        if scheme_category:
            query = query.ilike("scheme_category", f"%{scheme_category}%")
        if farmer_id:
            query = query.eq("farmer_id", farmer_id)
        if sahayak_id:
            query = query.eq("sahayak_id", sahayak_id)
        if mandal_id:
            query = query.eq("mandal_id", mandal_id)
            
        res = query.range(offset, offset + limit - 1).execute()
        return res.data
    
    @staticmethod
    def count(
        status: Optional[str] = None,
        component: Optional[str] = None,
        scheme_category: Optional[str] = None,
        farmer_id: Optional[str] = None,
        sahayak_id: Optional[str] = None,
        mandal_id: Optional[str] = None,
    ) -> int:
        query = supabase.table("applications").select("*", count="exact")
        
        if status:
            query = query.ilike("status", f"%{status}%")
        if component:
            query = query.ilike("component", f"%{component}%")
        if scheme_category:
            query = query.ilike("scheme_category", f"%{scheme_category}%")
        if farmer_id:
            query = query.eq("farmer_id", farmer_id)
        if sahayak_id:
            query = query.eq("sahayak_id", sahayak_id)
        if mandal_id:
            query = query.eq("mandal_id", mandal_id)
            
        res = query.execute()
        return res.count if res.count is not None else len(res.data)

    @staticmethod
    def get_by_id(application_id: str) -> Optional[dict]:
        res = supabase.table("applications").select("*").eq("application_id", application_id).limit(1).execute()
        return res.data[0] if res.data else None
        
    @staticmethod
    def update(application_id: str, data: dict) -> Optional[dict]:
        res = supabase.table("applications").update(data).eq("application_id", application_id).execute()
        return res.data[0] if res.data else None
