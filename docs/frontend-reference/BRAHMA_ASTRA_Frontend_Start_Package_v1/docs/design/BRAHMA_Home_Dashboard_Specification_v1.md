# BRAHMA Home Dashboard — Milestone Specification v1

**Status:** Design reference created using the previously approved v1 tokens. This is the review candidate for dashboard approval. It is not yet an implemented browser screenshot.

## Locked identity
- Gold `#F6C87A`; gold light `#FFE5A7`
- Violet `#8B5CF6`; cyan `#06B6D4`; purple `#A855F7`
- Base background `#0B0F1A`; elevated background `#111827`; card surface `#1E1B3D`
- Primary text `#F7F7FB`; secondary text `#A7AEC2`; border `#30384D`
- UI font Poppins; code font JetBrains Mono
- No silent changes to these values.

## Desktop layout
- Sidebar expanded width: 260 px; collapsed target: 80 px.
- Header: global search, notifications, appearance/theme, profile and utility controls.
- Main content: welcome/hero area, primary composer, suggested prompt chips, feature cards.
- Right rail: recent activity, quick tools, recent projects.
- Main cards: Chat, Research, Create Image, Documents, Projects, Memory, Agents, ASTRA.
- Spacing candidate: 24 px section padding, 20 px card padding, 16 px element spacing; 16 px standard card radius.
- Use cosmic art only in hero/background areas; keep controls and content readable against dark surfaces.

## Interaction rules
- Search opens global search; keyboard shortcut shown only if implemented.
- Composer accepts prompt text and attachments; send button submits. Microphone appears only if voice input is supported and permission is granted.
- Quick action cards navigate to the corresponding module.
- Recent activity/projects come from actual data and have loading, empty, and error states.
- Notification/profile/theme controls must perform real actions; no decorative controls.
- Sidebar active state uses violet; gold is reserved for identity/emphasis.
- Support keyboard focus, accessible names, reduced motion, and responsive navigation.

## Responsive behavior
- Desktop >= 1200 px: expanded sidebar, central dashboard and right rail.
- Tablet 768–1199 px: compact sidebar; right rail may move below main content.
- Mobile <= 767 px: navigation becomes accessible drawer/bottom navigation; single-column cards; composer remains reachable; no horizontal overflow.

## Acceptance checklist
- [ ] Exact approved token values used from centralized CSS variables.
- [ ] Logo uses approved vector asset, not a cropped generated image.
- [ ] No fake recent activity, counts, plan details, or tool availability.
- [ ] Every visible button/control has real behavior or is removed.
- [ ] Loading, empty, offline, error, and success states are covered.
- [ ] Keyboard and screen-reader behavior checked.
- [ ] Desktop/tablet/mobile screenshots compared against approved references.
- [ ] Any deviation from the design is explicitly approved before merging.

## Approval gate
This reference is ready for visual review. Once the dashboard is approved, use it as the master shell for the remaining BRAHMA screens. Exact vector logo asset and implemented screenshot validation remain required before production sign-off.
