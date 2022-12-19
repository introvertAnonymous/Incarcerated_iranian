import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from snscrape.modules.twitter import TwitterHashtagScraper

router = APIRouter()


@router.get("/hashtag_tweets", response_model=List[str])
async def get_hashtag_tweets(
    query: str,
    limit: int = 10,
    session: AsyncSession = Depends(deps.get_session),
):
    if len(query) < 3:
        return []
    items = set()
    hashtag_scraper_now = TwitterHashtagScraper(query + " since:2022-09-15")
    for item in hashtag_scraper_now.get_items():
        items.add(item.id)
        break
    hashtag_scraper = TwitterHashtagScraper(
        query + " min_faves:500 -filter:replies since:2022-09-15"
    )
    for item in hashtag_scraper.get_items():
        items.add(item.id)
        if len(items) >= limit:
            break
    if len(items) >= limit:
        return list(items)
    hashtag_scraper = TwitterHashtagScraper(query + " -filter:replies since:2022-09-15")
    for item in hashtag_scraper.get_items():
        items.add(item.id)
        if len(items) >= limit:
            break
    if len(items) >= limit:
        return list(items)
    for item in hashtag_scraper_now.get_items():
        items.add(item.id)
        if len(items) >= limit:
            break
    return list(items)
