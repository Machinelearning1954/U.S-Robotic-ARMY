# Facilities

Registry of headquarters and facilities for the U.S. Robotic Army project.

Facility records live in [`headquarters.json`](./headquarters.json) and are
validated against [`headquarters.schema.json`](./headquarters.schema.json).

## Facilities

| ID | Name | Organization | Nation | Type | Status | Location |
| --- | --- | --- | --- | --- | --- | --- |
| `cia-hq-dubai` | CIA Headquarters — Dubai | CIA | United States of America | headquarters | active | Dubai, United Arab Emirates |

## Adding a facility

1. Append a new object to the `facilities` array in `headquarters.json`.
2. Use a unique, kebab-case `id`.
3. Make sure the record satisfies `headquarters.schema.json`.
4. Add a row to the table above.
