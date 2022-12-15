import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import get_password_hash
from app.models import User
from app.schemas.requests import UserCreateRequest, UserUpdatePasswordRequest
from app.schemas.responses import UserResponse
from snscrape.modules.twitter import TwitterHashtagScraper

router = APIRouter()


@router.get("/hashtag_tweets", response_model=List[str])
async def get_hashtag_tweets(
    query: str,
    limit: int = 10,
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    if len(query) < 3:
        return []
    hashtag_scraper = TwitterHashtagScraper(query + " min_faves:100 -filter:replies")
    items = set()
    for item in hashtag_scraper.get_items():
        items.add(item.id)
        if len(items) >= limit:
            break
    if len(items) >= limit:
        return list(items)
    hashtag_scraper = TwitterHashtagScraper(query + " -filter:replies")
    for item in hashtag_scraper.get_items():
        items.add(item.id)
        if len(items) >= limit:
            break
    if len(items) >= limit:
        return list(items)
    hashtag_scraper = TwitterHashtagScraper(query)
    for item in hashtag_scraper.get_items():
        items.add(item.id)
        if len(items) >= limit:
            break
    return list(items)
