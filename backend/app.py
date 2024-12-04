from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import httpx
from bs4 import BeautifulSoup
import asyncio

app = FastAPI()

class JobData(BaseModel):
    company_name: str
    job_title: str

class PaginatedResponse(BaseModel):
    jobs: List[JobData]
    total_pages: Optional[int]  # Include total pages only on the first response

class ErrorResponse(BaseModel):
    error: str

# Headers to mimic a browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://wellfound.com/"
}

@app.get("/scrape", response_model=PaginatedResponse, responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def scrape_jobs(keyword: str, page: int = Query(1, ge=1)):
    base_url = f"https://wellfound.com/role/{keyword}?page={page}"
    async with httpx.AsyncClient(headers=HEADERS) as client:
        try:
            # Delay to avoid triggering rate limits
            await asyncio.sleep(2)
            response = await client.get(base_url)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"HTTP error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

        soup = BeautifulSoup(response.text, "html.parser")

        # Extract total pages on the first page request
        total_pages = None
        if page == 1:
            pagination_header = soup.find("h4", class_="styles_resultCount__Biln8")
            if pagination_header:
                pagination_text = pagination_header.get_text(strip=True)
                try:
                    total_pages = int(pagination_text.split("of")[-1].strip())
                except (ValueError, IndexError):
                    total_pages = 1  # Default to 1 if parsing fails

        # Find all company cards on the current page
        company_cards = soup.find_all("div", class_="mb-6 w-full rounded border border-gray-400 bg-white")
        if not company_cards:
            raise HTTPException(status_code=404, detail="No job listings found on this page.")

        job_list = []
        for card in company_cards:
            # Extract company name
            company_name = card.find("h2", class_="inline text-md font-semibold")
            company_name = company_name.text.strip() if company_name else "N/A"

            # Extract all job titles under each company
            job_titles = card.find_all("a", class_="mr-2 text-sm font-semibold text-brand-burgandy hover:underline")

            # Append job information to the list
            for job_title in job_titles:
                job_list.append(JobData(
                    company_name=company_name,
                    job_title=job_title.text.strip()
                ))

        return PaginatedResponse(jobs=job_list, total_pages=total_pages)
