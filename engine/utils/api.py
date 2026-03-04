"""API helpers: rate limiting, retries for nba_api."""

import logging
import time

from constants import REQUEST_DELAY

log = logging.getLogger(__name__)


def safe_request(endpoint_cls, **kwargs):
    """Call nba_api endpoint with delay and retry on failure."""
    time.sleep(REQUEST_DELAY)
    try:
        return endpoint_cls(**kwargs)
    except Exception as e:
        log.warning("API request failed: %s — retrying in 3s", e)
        time.sleep(3)
        return endpoint_cls(**kwargs)
