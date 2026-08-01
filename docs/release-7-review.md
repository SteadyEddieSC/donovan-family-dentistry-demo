# Release 7 Review Checklist

## Fillable patient form

- Rebuilt on a fixed grid rather than incrementally shifted.
- All text fields use the same fill, border color, and border width.
- Labels sit above their related fields with consistent clearance.
- Date of birth, M/F checkboxes, and marital status share a clean baseline.
- City label is not clipped by its field.
- All three pages were rendered with PDFium and Poppler.
- All 137 fillable fields remain present.
- Build verifies file size and SHA-256.

## Modern mobile concept

- Controlled light palette prevents browser auto-darkening from destroying contrast.
- PHI warning uses dark text on a pale warning background.
- Header Call control contains one visible Call label.
- Header and footer logos sit on white rounded brand cards.
- Secondary buttons have visible two-pixel borders.
- The location card follows the office image on mobile instead of covering it.
- Bottom Call, Directions, and Forms dock has a visible outline and opaque background.

## Content architecture

- Homepage provides concise paths rather than repeating full service copy.
- About contains the practice story, values, and local context.
- Team contains all dentist and staff profiles.
- Services remains the detailed treatment source.
- Forms and Contact have distinct operational purposes.

## Production boundary

- Contact workflow still sends and stores nothing.
- Medical-history submission remains offline.
- Fictional staff and history content must be verified or replaced before production launch.
- Domain, DNS, email, analytics, and production form routing remain unchanged.
