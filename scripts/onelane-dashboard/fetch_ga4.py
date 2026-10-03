"""Haalt GA4-data op voor het OneLane campagnedashboard en schrijft data.json.

Draait dagelijks via .github/workflows/onelane-dashboard.yml.
Vereist secret GA_SERVICE_ACCOUNT (inhoud van het JSON-sleutelbestand).
"""
import datetime
import json
import os
import sys
import urllib.error
import urllib.request
from zoneinfo import ZoneInfo

PROPERTY = os.environ.get("GA_PROPERTY_ID", "554527914")
STREAM = "onelane.nl"
HOST = "onelane.nl"
START = "2026-10-01"
OUT = "public/werk/onelane/2026/campagne/dashboard/data.json"
METRICS = ["sessions", "totalUsers", "newUsers", "engagementRate", "averageSessionDuration", "screenPageViews"]
KEYS = ["s", "u", "nu", "e", "d", "v"]


def get_token():
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request

    info = json.loads(os.environ["GA_SERVICE_ACCOUNT"])
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    creds.refresh(Request())
    return creds.token


def exact(field, value):
    return {"filter": {"fieldName": field, "stringFilter": {"matchType": "EXACT", "value": value}}}


def make_report(token, start, end):
    def report(dims, mets, limit=None, nl_only=False):
        exprs = [exact("streamName", STREAM), exact("hostName", HOST)]
        if nl_only:
            exprs.append(exact("country", "Netherlands"))
        body = {
            "dateRanges": [{"startDate": start, "endDate": end}],
            "dimensions": [{"name": d} for d in dims],
            "metrics": [{"name": m} for m in mets],
            "dimensionFilter": {"andGroup": {"expressions": exprs}},
        }
        if dims and dims != ["date"]:
            body["orderBys"] = [{"metric": {"metricName": mets[0]}, "desc": True}]
        if limit:
            body["limit"] = limit
        req = urllib.request.Request(
            "https://analyticsdata.googleapis.com/v1beta/properties/" + PROPERTY + ":runReport",
            data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                res = json.loads(r.read())
        except urllib.error.HTTPError as e:
            sys.exit("GA4 fout " + str(e.code) + ": " + e.read().decode()[:500])
        out = []
        for row in res.get("rows", []):
            dv = [x.get("value", "") for x in row.get("dimensionValues", [])]
            mv = [float(x.get("value", 0) or 0) for x in row.get("metricValues", [])]
            out.append((dv, mv))
        return out

    return report


def num(v):
    return int(v) if float(v).is_integer() else round(v, 4)


def rec(name, mv, keys):
    r = {"n": name}
    for k, v in zip(keys, mv):
        r[k] = num(v)
    return r


def build(report, start, end, today):
    tot = report([], METRICS + ["screenPageViewsPerSession"])
    tv = tot[0][1] if tot else [0] * (len(METRICS) + 1)
    totals = {k: num(v) for k, v in zip(KEYS + ["vps"], tv)}

    by_date = {}
    for dv, mv in report(["date"], METRICS):
        d = dv[0]
        by_date[d[:4] + "-" + d[4:6] + "-" + d[6:]] = mv
    days = []
    cur = datetime.date.fromisoformat(start)
    last = datetime.date.fromisoformat(end)
    while cur <= last:
        iso = cur.isoformat()
        mv = by_date.get(iso, [0] * len(METRICS))
        r = {"date": iso}
        for k, v in zip(KEYS, mv):
            r[k] = num(v)
        days.append(r)
        cur += datetime.timedelta(days=1)

    def dim(name, limit):
        return [rec(dv[0], mv, KEYS) for dv, mv in report([name], METRICS, limit)]

    geo = ["sessions", "totalUsers", "engagementRate"]
    gk = ["s", "u", "e"]

    def geo_dim(name, limit, nl_only):
        return [rec(dv[0], mv, gk) for dv, mv in report([name], geo, limit, nl_only)]

    age = [(dv[0], mv[0]) for dv, mv in report(["userAgeBracket"], ["totalUsers"])]
    gender = [(dv[0], mv[0]) for dv, mv in report(["userGender"], ["totalUsers"])]
    age = sorted([a for a in age if a[0] not in ("unknown", "(not set)", "")])
    gender = [g for g in gender if g[0] not in ("unknown", "(not set)", "")]
    demografie = None
    if age or gender:
        demografie = {
            "age": [{"n": n, "v": num(v)} for n, v in age],
            "gender": [{"n": n, "v": num(v)} for n, v in gender],
        }

    return {
        "meta": {"source": "GA4 Data API", "property": "OneLane", "stream": STREAM, "start": start, "end": end, "updated": today},
        "totals": totals,
        "days": days,
        "dims": {
            "kanalen": dim("sessionDefaultChannelGrouping", 25),
            "bronnen": dim("sessionSourceMedium", 25),
            "landingspaginas": dim("landingPage", 25),
        },
        "countries": geo_dim("country", 10, False),
        "regions": geo_dim("region", 20, True),
        "cities": geo_dim("city", 25, True),
        "devices": geo_dim("deviceCategory", 5, False),
        "demografie": demografie,
    }


def main():
    now = datetime.datetime.now(ZoneInfo("Europe/Amsterdam")).date()
    end = (now - datetime.timedelta(days=1)).isoformat()
    if end < START:
        sys.exit("Periode is nog niet begonnen")
    data = build(make_report(get_token(), START, end), START, end, now.isoformat())
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
    print("Geschreven:", OUT, "sessies", data["totals"]["s"], "t/m", end)


if __name__ == "__main__":
    main()
