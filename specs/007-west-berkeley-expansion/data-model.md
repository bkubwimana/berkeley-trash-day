# Data Model: West Berkeley Service Area

```text
ServiceArea
  id                   stable report key
  addressRange         resident-facing hundred range
  addressMin           lowest positive City address
  addressMax           highest City address
  streetName           normalized display name
  officialStreetName   City GIS FULLNAME value
  aliases[]            searchable abbreviations and ordinal variants
  startStreet          derived nearby cross street, when available
  endStreet            derived nearby cross street, when available
  center               [longitude, latitude]
  geometry             LineString or MultiLineString in WGS84 (map-only generated module)
  sourceCenterlineIds[] City CENTERLINEID provenance
  sourceUpdatedAt      most recent source timestamp in the group
```

The application report still stores `block` for backward compatibility, but its value is the stable `ServiceArea.id`. Public street and range labels may be stored for auditability; no exact address is collected.
