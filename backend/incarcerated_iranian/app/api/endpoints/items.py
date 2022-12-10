from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import get_password_hash
from app.models import User
from app.schemas.requests import UserCreateRequest, UserUpdatePasswordRequest
from app.schemas.responses import UserResponse
from incarcerated_api.pydantic_types import Item
from incarcerated_api.constants import DATA_PATH
from incarcerated_api.utils.elastic import get_es_client
from incarcerated_api.utils import convert_to_elastic, get_item as get_people_item
from incarcerated_api.utils import update_wiki_item
import os
from glob import glob

router = APIRouter()

es = get_es_client()


@router.get("/item", response_model=Item)
async def get_item(
    wiki_id: str,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    try:
        item = es.get(index="people", id=wiki_id).body.get("_source")
        return get_people_item(item)
    except Exception as e:
        return {"Error": str(e)}


filenames = glob(os.path.join(DATA_PATH, "wikidata_people") + "/*.json")


@router.get("/items", response_model=List[Item])
async def get_items(
    size: int,
    offset: int = 0,
    sort: str = None,
    asc: bool = True,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    sort_key = [{sort: {"order": "asc" if asc else "desc"}}] if sort else None
    selected = [
        d.get("_source")
        for d in es.search(index="people", size=size, from_=offset, sort=sort_key)
        .body.get("hits", {})
        .get("hits", [])
    ]
    items = [get_people_item(f) for f in selected]
    return items


@router.get("/count", response_model=int)
async def get_count_items(
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    count = es.count(index="people").body.get("count")
    return count


@router.post("/update", response_model=Item)
async def update_item(
    item: Item,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    update_wiki_item(item)
    elastic_doc = convert_to_elastic(item)
    es.update(index="people", id=item.wikidata, doc=elastic_doc)
    return item


# @router.delete("/me", status_code=204)
# async def delete_current_user(
#     current_user: User = Depends(deps.get_current_user),
#     session: AsyncSession = Depends(deps.get_session),
# ):
#     """Delete current user"""
#     await session.execute(delete(User).where(User.id == current_user.id))
#     await session.commit()


# @router.post("/reset-password", response_model=UserResponse)
# async def reset_current_user_password(
#     user_update_password: UserUpdatePasswordRequest,
#     session: AsyncSession = Depends(deps.get_session),
#     current_user: User = Depends(deps.get_current_user),
# ):
#     """Update current user password"""
#     current_user.hashed_password = get_password_hash(user_update_password.password)
#     session.add(current_user)
#     await session.commit()
#     return current_user


# @router.post("/register", response_model=UserResponse)
# async def register_new_user(
#     new_user: UserCreateRequest,
#     session: AsyncSession = Depends(deps.get_session),
# ):
#     """Create new user"""
#     result = await session.execute(select(User).where(User.email == new_user.email))
#     if result.scalars().first() is not None:
#         raise HTTPException(status_code=400, detail="Cannot use this email address")
#     user = User(
#         email=new_user.email,
#         hashed_password=get_password_hash(new_user.password),
#     )
#     session.add(user)
#     await session.commit()
#     return user
