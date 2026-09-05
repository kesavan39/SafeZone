from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.core.supabase import db
from app.schemas.domain import LayoutCreate, LayoutObjectSchema

router = APIRouter(prefix="/api/layouts", tags=["Layouts"])

@router.get("/project/{project_id}")
def get_layouts_by_project(project_id: str):
    layouts = db.filter_by("layouts", "project_id", project_id)
    result = []
    for l in layouts:
        l_copy = dict(l)
        l_copy["objects"] = db.filter_by("layout_objects", "layout_id", l["id"])
        result.append(l_copy)
    return result

@router.get("/{layout_id}")
def get_layout(layout_id: str):
    layout = db.get_by_id("layouts", layout_id)
    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")
    
    objects = db.filter_by("layout_objects", "layout_id", layout_id)
    l_copy = dict(layout)
    l_copy["objects"] = objects
    
    paths = db.get_all("paths")
    l_copy["paths"] = paths
    l_copy["robots"] = db.get_all("robots")
    l_copy["humans"] = db.get_all("humans")
    return l_copy

@router.post("")
def save_layout(layout_payload: LayoutCreate):
    l_data = layout_payload.model_dump()
    objects = l_data.pop("objects", [])
    
    existing = db.filter_by("layouts", "project_id", layout_payload.project_id)
    if existing:
        layout_id = existing[0]["id"]
        saved_layout = db.update("layouts", layout_id, l_data)
    else:
        saved_layout = db.insert("layouts", l_data)
        layout_id = saved_layout["id"]

    saved_objects = []
    for obj in objects:
        obj["layout_id"] = layout_id
        if "id" in obj and obj["id"] and db.get_by_id("layout_objects", obj["id"]):
            obj_id = obj["id"]
            upd = db.update("layout_objects", obj_id, obj)
            saved_objects.append(upd)
        else:
            ins = db.insert("layout_objects", obj)
            saved_objects.append(ins)

    res = dict(saved_layout or l_data)
    res["objects"] = saved_objects
    return res

@router.post("/object")
def add_or_update_object(obj: LayoutObjectSchema):
    data = obj.model_dump()
    if data.get("id") and db.get_by_id("layout_objects", data["id"]):
        return db.update("layout_objects", data["id"], data)
    return db.insert("layout_objects", data)
