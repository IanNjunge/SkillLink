from __future__ import annotations
import re
from typing import Optional
import requests
from bs4 import BeautifulSoup


def fetch_page_title(url: str, timeout: int = 5) -> Optional[str]:
	try:
		resp = requests.get(url, timeout=timeout, headers={"User-Agent": "SkillLinkBot/1.0"})
		resp.raise_for_status()
		soup = BeautifulSoup(resp.text, "html.parser")
		# Prefer og:title
		og = soup.find("meta", attrs={"property": "og:title"}) or soup.find("meta", attrs={"name": "og:title"})
		if og and og.get("content"):
			return og["content"].strip()[:512]
		title = soup.title.string if soup.title else None
		if title:
			return re.sub(r"\s+", " ", title).strip()[:512]
	except Exception:
		return None
	return None
