# Log Query Tags

This document lists the supported log query tags and the rules for formatting them.

## General rules

- Use one value per tag in a single query. If you need multiple values for the same tag, run multiple queries.
- Use underscores instead of spaces (example: school:harvard_south).
- Wildcards (`*`) are allowed only on direct and relational tags.
- Special tags do not allow wildcards.
- Free-text terms are added as plain words (no colons). These search the log message text.

## Direct tags

These map directly to log columns.

| Tag      | Notes         | Wildcards |
| -------- | ------------- | --------- |
| id       | Log ID        | Yes       |
| level    | Log level     | Yes       |
| category | Category text | Yes       |

## Special tags

These require custom handling.

| Tag    | Notes                                 | Wildcards |
| ------ | ------------------------------------- | --------- |
| time   | HH:MM or HH:MM:SS                     | No        |
| date   | YYYY-MM-DD (slashes are accepted)     | No        |
| type   | Entity type ID (non-negative integer) | No        |
| entity | Entity ID (non-negative integer)      | No        |

## Relational tags

These search related entities (names, titles, or labels).
When multiple relational tags are provided, they are treated as OR (match any tag), while still combining with other filter groups using AND.

| Tag       | Notes           | Wildcards |
| --------- | --------------- | --------- |
| student   | First/last name | Yes       |
| school    | School name     | Yes       |
| teacher   | First/last name | Yes       |
| booking   | Booking title   | Yes       |
| room      | Room name       | Yes       |
| equipment | Equipment name  | Yes       |
| parent    | First/last name | Yes       |

## Free-text

Use plain words without colons. Multiple words are allowed. These terms search the log message text.

## Examples

```text
id:30* level:4
```

```text
teacher:john_doe date:2026-01-27
```

```text
school:harvard_south changed enrollment
```

```text
entity:332 type:13
```

```text
teacher:* category:sync
```
