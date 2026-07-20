# VOL-009 — Business Intelligence & Dashboards

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## BI Architecture

```
Event Data (PostgreSQL)
       │
       ▼
CDC (Debezium) → Kafka
       │
       ▼
ClickHouse (Analytical DB)
       │
       ▼
BI API → Dashboards (Grafana / Embedded)
```

### Data Pipeline

```
Source ──► Kafka Connect ──► ClickHouse ──► Materialized Views
                                          │
                                          ├── Real-time dashboards
                                          ├── Historical reports
                                          └── AI analytics
```

---

## Dashboard Naming Convention

```
DSH-{category}-{number}

Categories:
- EXEC: Executive
- FIN: Financial
- SALES: Commercial
- MKT: Marketing
- OPS: Operational
- SPONSOR: Sponsors
- AI: AI Analytics
- SEC: Security
- ESG: Environmental & Social
```

---

## DSH-EXEC-001 — Executive Dashboard

Real-time overview for event organizers.

### KPIs

| Metric | Source | Refresh |
|--------|--------|---------|
| Total check-ins | ClickHouse | Real-time |
| Occupancy rate | ClickHouse | Real-time |
| Revenue | Payment service | 30s |
| Active attendees now | ClickHouse | Real-time |
| Check-in rate per hour | ClickHouse | Real-time |
| Social media mentions | External API | 5min |

### Charts

| Chart | Type | Description |
|-------|------|-------------|
| Check-in flow | Time series (line) | Per hour, last 7 days |
| Occupancy gauge | Radial gauge | % of capacity |
| Revenue trend | Area chart | Daily revenue |
| Event timeline | Timeline | Today's schedule |
| Top sponsors | Horizontal bar | Visits per sponsor |

---

## DSH-FIN-001 — Financial Dashboard

### KPIs

| Metric | Source |
|--------|--------|
| Total revenue | Payment service |
| Refund rate | Payment service |
| Average ticket price | Ticket service |
| Revenue by ticket type | Ticket service |
| Pending payments | Payment service |
| Platform fees | Billing service |

### Charts

| Chart | Type |
|-------|------|
| Revenue by day | Time series |
| Revenue by ticket type | Pie |
| Payment methods | Donut |
| Revenue goal | Progress bar |
| Daily revenue comparison | Bar (today vs yesterday) |

---

## DSH-SALES-001 — Sales Dashboard

### KPIs

| Metric | Source |
|--------|--------|
| Tickets sold today | Ticket service |
| Conversion rate | Analytics |
| Leads generated | CRM |
| Deals in pipeline | CRM |
| Deal value (weighted) | CRM |
| Avg sales cycle | CRM |

### Charts

| Chart | Type |
|-------|------|
| Sales funnel | Funnel |
| Deal by stage | Horizontal bar |
| Sales by seller | Bar |
| Conversion by source | Pie |
| Ticket sales trend | Time series |

---

## DSH-MKT-001 — Marketing Dashboard

### KPIs

| Metric | Source |
|--------|--------|
| Email open rate | Marketing |
| Click-through rate | Marketing |
| Campaign reach | Marketing |
| Social engagement | Marketing |
| Registration by source | Analytics |
| Cost per registration | Marketing |

### Charts

| Chart | Type |
|-------|------|
| Campaign performance | Table |
| Channel comparison | Bar |
| Email funnel | Funnel |
| Social media engagement | Time series |
| Registration source | Pie |

---

## DSH-OPS-001 — Operational Dashboard

Event operations center for real-time monitoring.

### KPIs

| Metric | Source |
|--------|--------|
| Current check-ins | Check-in service |
| Queue time avg | Check-in service |
| Active devices | Device sync |
| Occupancy per area | Sensor/Analytics |
| Entry per gate | Access control |
| Sync status (devices) | Check-in service |

### Charts

| Chart | Type | Description |
|-------|------|-------------|
| Entry flow by gate | Bar | Per gate/entrance |
| Occupancy heatmap | Heatmap | Map overlay |
| Queue time | Time series | Average per 5min |
| Device status | Table | Online/offline/sync |
| Peak hour prediction | Line | Forecast |

### Map View

```
┌─────────────────────────────────────┐
│  ┌──────────────────────────────┐   │
│  │      EVENT MAP               │   │
│  │                              │   │
│  │  [Gate 1] ●●●●●● 80%         │   │
│  │  [Gate 2] ●●●○○○ 45%         │   │
│  │  [Gate 3] ●●●●●● 90%         │   │
│  │                              │   │
│  │  ● Restricted Area           │   │
│  │  ● VIP Area   ● Stage        │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## DSH-SPONSOR-001 — Sponsor Dashboard

### KPIs

| Metric | Source |
|--------|--------|
| Booth visits | Access/NFC |
| Avg stay time | Analytics |
| Unique visitors | Analytics |
| Return visitors | Analytics |
| Lead capture | CRM |
| Sponsor ranking | Analytics |

### Charts

| Chart | Type |
|-------|------|
| Visits by sponsor | Horizontal bar |
| Stay time by sponsor | Bar |
| Traffic by hour (per sponsor) | Time series |
| Sponsor comparison | Radar |
| Visitor profile | Demographics table |

### Per-Sponsor Detail

```
┌─────────────────────────────────────┐
│  🥇 Banco XYZ                       │
│  ─────────────────────────────────   │
│  Visits:      2,450  (+12% vs avg)  │
│  Avg stay:    8m32s  (+3m vs avg)   │
│  Unique:      1,890                 │
│  Returns:       312  (12.7%)        │
│  Leads:         189  (7.7%)         │
│  Ranking:       1º   of 18          │
│                                      │
│  Peak hours: 14h-16h                │
│  Top profile: Directors (48)        │
│  Company size: 50-200 emp (34%)     │
└─────────────────────────────────────┘
```

---

## DSH-AI-001 — AI Analytics

Natural language query interface + insights.

### Pre-built Questions

| Category | Questions |
|----------|-----------|
| Attendance | "How many people came today?" / "Peak hour?" |
| Demographics | "Cities with most attendees?" / "Age range?" |
| Sponsors | "Which sponsor had best ROI?" / "Booth ranking?" |
| Revenue | "Revenue per day?" / "Avg ticket by type?" |
| Operations | "Gate with longest queue?" / "Capacity status?" |
| Engagement | "Sessions with most attendance?" / "NPS score?" |

### Insights Engine

```json
{
    "insight": "Check-in peak was 9-10 AM (3,200 entries)",
    "recommendation": "Consider opening gates 30min earlier tomorrow",
    "benchmark": "25% higher than industry average",
    "confidence": 0.87
}
```

### KPI Cards (Auto-generated)

| Insight | Value | vs Benchmark |
|---------|-------|-------------|
| Peak check-in hour | 09:00-10:00 | +25% vs avg |
| Avg stay duration | 4h32m | +1h12m vs similar events |
| Sponsor ROI | 3.2x | +0.8x vs industry |
| NPS Score | 78 | Excellent |
| No-show rate | 8.3% | -2.1% vs avg |

---

## DSH-SEC-001 — Security Dashboard

| Metric | Source |
|--------|--------|
| Access denied attempts | Access control |
| Suspicious activity | AI monitoring |
| Active alerts | Security system |
| CCTV online status | Security |
| Emergency exits status | IoT sensors |
| Staff on duty | HR system |

---

## DSH-ESG-001 — ESG Dashboard

| Metric | Source |
|--------|--------|
| CO2 offset | Carbon API |
| Waste recycling | IoT sensors |
| Water consumption | IoT sensors |
| Energy usage | IoT sensors |
| Diversity index | Registration data |
| Accessibility score | Survey/Audit |
| Local community impact | Survey |

---

## Report Auto-Generation

Reports generated automatically by AI after events.

### Post-Event Report Structure

```json
{
    "event": {
        "name": "Feira Agropecuária 2026",
        "date": "15-18 Set 2026",
        "location": "Ribeirão Preto, SP"
    },
    "executive_summary": "text...",
    "attendance": {
        "total": 12450,
        "occupancy": "78%",
        "peak_hour": "09:00-10:00",
        "no_show_rate": "8.3%"
    },
    "revenue": {
        "total": "R$ 892.450,00",
        "tickets_sold": 12450,
        "avg_ticket": "R$ 71,68",
        "refund_rate": "2.1%"
    },
    "sponsors": {
        "total": 18,
        "top_roi": "Banco XYZ (3.2x)",
        "total_visits": 18750,
        "avg_stay": "6m12s"
    },
    "engagement": {
        "nps": 78,
        "app_downloads": 5400,
        "networking_matches": 890,
        "certificates_issued": 3200
    },
    "ai_insights": {
        "improvements": ["Open gates earlier", "More coffee stations"],
        "predictions": ["Next event could be 15% larger"],
        "benchmarks": "vs similar events"
    },
    "export": {
        "pdf_url": "https://cdn.eventos.ai/reports/feira-agro-2026.pdf",
        "csv_url": "https://cdn.eventos.ai/reports/feira-agro-2026.csv"
    }
}
```

---

## ClickHouse Schema

```sql
-- Event fact table
CREATE TABLE event_facts (
    event_id UUID,
    tenant_id UUID,
    timestamp DateTime,
    metric String,         -- check_in, ticket_sold, booth_visit
    category String,       -- vip, visitor, sponsor, staff
    method String,         -- qr, face, manual, nfc
    value Int32,
    metadata JSON
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (event_id, timestamp);

-- Materialized aggregation: hourly metrics
CREATE MATERIALIZED VIEW hourly_metrics
ENGINE = SummingMergeTree()
ORDER BY (event_id, hour)
AS SELECT
    event_id,
    toStartOfHour(timestamp) AS hour,
    metric,
    count() AS count,
    sum(value) AS total
FROM event_facts
GROUP BY event_id, hour, metric;

-- Materialized aggregation: sponsor booth visits
CREATE MATERIALIZED VIEW sponsor_metrics
ENGINE = SummingMergeTree()
ORDER BY (event_id, sponsor_id)
AS SELECT
    event_id,
    metadata['sponsor_id'] AS sponsor_id,
    count() AS visits,
    uniq(metadata['attendee_id']) AS unique_visitors
FROM event_facts
WHERE metric = 'booth_visit'
GROUP BY event_id, sponsor_id;
```

---

## Related Documents

- VOL-002: Architecture (Analytics service, ClickHouse)
- VOL-004: Database (Event facts, aggregations)
- VOL-007: AI (Analytics AI agent)
