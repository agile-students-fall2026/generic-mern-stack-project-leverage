# NYC Rent Data Sources

Spike for issue #8. Goal was to find public data we can use for the rent comparison (Price result, Comparable apartments) and the Rent trends screen.

## Sources we looked at

| Source | What it has | Area level | Updated | How to get it | Limits |
|---|---|---|---|---|---|
| StreetEasy Data Dashboard | Median asking rent, rent index, inventory, by bedroom count | Borough and neighborhood | Monthly | CSV download | Have to credit StreetEasy anywhere we show it |
| Zillow Observed Rent Index (ZORI) | Typical market rent over time | ZIP, city, county, metro | Monthly | CSV download, no API key | Free to use but must credit Zillow, and follow their terms of use |
| Census ACS (table B25064) | Median gross rent (rent + utilities) | ZIP (ZCTA), census tract | Yearly (5-year estimates) | Census API or data.census.gov | Public, but data is a year or two behind |
| HUD Small Area Fair Market Rents | 40th percentile rent by bedroom count | ZIP | Yearly | API (needs a free token) or Excel download | Public. Made for vouchers, so it's lower than market rent |
| NYC Rent Guidelines Board building lists | Buildings with at least one rent stabilized unit | Building (address) | Yearly | Download from the RGB site | Public. Doesn't say which units are stabilized |

## What we should use

1. **StreetEasy** for the Rent trends screen. It's already split by NYC neighborhood and bedroom count, which matches how our areas work.
2. **Zillow ZORI** as the ZIP-level number behind the fair price check, since users enter an address and we can map it to a ZIP.
3. **Census ACS** as a backup for areas where StreetEasy or Zillow don't have enough data.
4. **RGB building list** later, if we want to warn renters that a building might be rent stabilized.

HUD is probably not worth it since it's meant for voucher limits, not market rent.

## Things to keep in mind

- None of these give single listings, only averages. So Comparable apartments will still need our own data (mock data now, user outcomes later).
- StreetEasy and Zillow are CSV only, no API. For the database sprint the easiest thing is a script that downloads the CSV once a month and loads it into MongoDB.
- We need a "Data from StreetEasy / Zillow" line in the app wherever we show their numbers.

## Links

- StreetEasy: https://streeteasy.com/blog/data-dashboard
- Zillow: https://www.zillow.com/research/data/
- Census API: https://api.census.gov/data/2023/acs/acs5
- HUD Fair Market Rents: https://www.huduser.gov/portal/datasets/fmr.html
- RGB building lists: https://rentguidelinesboard.cityofnewyork.us/resources/rent-stabilized-building-lists/
