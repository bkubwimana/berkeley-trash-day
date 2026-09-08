# Data Model: Community Collection Schedule Tracker

## Enumerations

### SupportedBlock

`2100 | 2200 | 2300 | 2400`

Each value means the corresponding block of 9th Street, Berkeley, California. No parcel,
side-of-street, or cross-street boundary is inferred.

### CollectionStream

`trash | recycling | compost`

### Weekday

`Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday`

The listed order is also the deterministic tie-break order for selecting a display leader.
A tied result cannot become consensus.

## CommunityReport

One immutable community observation.

| Field | Type | Required | Validation | Public use |
|---|---|---:|---|---|
| `block` | SupportedBlock | yes | Exact enumeration | Grouping and display |
| `stream` | CollectionStream | yes | Exact enumeration | Grouping and display |
| `day` | Weekday | yes | Exact enumeration | Aggregation and display |
| `reportedAt` | UTC timestamp | yes | Assigned by service | 180-day eligibility |
| `street` | string | yes | Fixed as `9th Street` | Location label |
| `city` | string | yes | Fixed as `Berkeley, CA` | Location label |
| `source` | string | yes | Fixed as `community` | Provenance label |

No application report may contain a name, account identifier, contact detail, exact
address, photograph, coordinates, free-form comment, client-provided timestamp, or IP
address.

### Lifecycle

1. **Received**: values and request size are validated.
2. **Stored**: the service adds fixed labels and server receipt time, then creates one
   immutable record.
3. **Recent**: the record is at most 180 days old and participates in aggregation.
4. **Expired from results**: the record is older than 180 days and does not participate in
   any public total, leader, percentage, or status. Physical deletion can be added later but
   is not required to calculate correct beta results.

## CollectionSummary

A computed view for one SupportedBlock and one CollectionStream.

| Field | Type | Rule |
|---|---|---|
| `day` | Weekday or null | Highest count; weekday order breaks a tie for display only |
| `winningReports` | nonnegative integer | Recent reports supporting `day` |
| `total` | nonnegative integer | All recent reports in the group |
| `agreementPercent` | integer 0–100 | Rounded `(winningReports / total) * 100` |
| `status` | status enumeration | Rule below |

### Status calculation

- `No reports`: `total` is 0; `day` is null.
- `Community consensus`: `total >= 3`, there is one unambiguous leading weekday, and
  `winningReports / total >= 2/3`.
- `Developing`: every other non-empty case.

The ratio, not the rounded display percentage, controls consensus. Thus 2 of 3 qualifies;
the displayed percentage is 67%.

## BlockSchedule

A computed view containing one CollectionSummary for each CollectionStream for a single
SupportedBlock.

## Relationships

```text
SupportedBlock 1 ── * CommunityReport * ── 1 CollectionStream
       │
       └── computed into one BlockSchedule
               └── contains three CollectionSummary values
```
