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
    hashtag_scraper = TwitterHashtagScraper(query + " min_faves:500")
    items = []
    for item in hashtag_scraper.get_items():
        items.append(item.id)
        if len(items) >= limit:
            break
    if len(items) >= limit:
        return items
    hashtag_scraper = TwitterHashtagScraper(query)

    for item in hashtag_scraper.get_items():
        items.append(item.id)
        if len(items) >= limit:
            break
    return items
