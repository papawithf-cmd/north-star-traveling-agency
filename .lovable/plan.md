# Fix job category images

## Scope
- Import the supplied NorthstarTravelingAgency repository into this project without changing its existing design or features.
- Replace the mismatched Drivers and Restaurant & Food Shop imagery with professional, realistic category-specific photos.
- Review and preserve correct built-in images for all current categories.

## Implementation
- Keep category names, descriptions, opportunity counts, links, card layout, navigation, application flow, admin area, authentication, and data access unchanged.
- Add explicit image mappings for Drivers and Restaurant & Food Shop, including reasonable slug variations already used by category records.
- Replace the current arbitrary fallback behavior so an unknown category cannot silently receive an unrelated category photo; custom admin-uploaded images remain authoritative.
- Preserve the existing 16:9 image frame and `object-cover` behavior, using source compositions with safe subject placement for mobile, tablet, and desktop crops.

## Verification
- Verify each built-in image against its category label.
- Check the home category section and full categories page at mobile, tablet, and desktop widths.
- Confirm every card still shows its category name, description, live opportunity count, and View Jobs action.
- Confirm the project builds cleanly and category links still work.
