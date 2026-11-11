---
name: AOKTAC
description: A bright bottling hall, then two navy chapters. Hall-white ground, Aoktac blue for action, navy ink, steel hairlines, Inter for the voice, Instrument Serif italic for accents.
colors:
  hall: "#F3F6F8"
  panel: "#FFFFFF"
  ink: "#0B1E33"
  ink-2: "#44566A"
  steel: "#C7D0D8"
  steel-2: "#E2E8ED"
  steel-strong: "#7D8B99"
  fog: "#DDE3E8"
  blue: "#004A91"
  blue-deep: "#00346A"
  selection: "#CCDDEE"
  pet: "#9FD0F2"
  on-ink: "#FFFFFF"
  on-ink-2: "#C9D6E2"
  on-ink-accent: "#CFE6F7"
  on-ink-muted: "#DCE6EF"
  amber: "#F28A2E"
  amber-ink: "#A8490A"
  placeholder: "#66778A"
  error: "#B3261E"
typography:
  display:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.7rem, 5.2vw, 5.6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  accent:
    fontFamily: "Instrument Serif, Times New Roman, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.3rem, 4.8vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  sector-word:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(4.5rem, 10.5vw, 11.5rem)"
    fontWeight: 500
    lineHeight: 0.86
    letterSpacing: "-0.06em"
  sector-word-narrow:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(3.6rem, 7vw, 7.6rem)"
    fontWeight: 500
    lineHeight: 0.86
    letterSpacing: "-0.06em"
  readout:
    fontFamily: "Instrument Serif, Times New Roman, Georgia, serif"
    fontSize: "clamp(3.6rem, 7vw, 6.4rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  plate-title:
    fontFamily: "Instrument Serif, Times New Roman, Georgia, serif"
    fontSize: "clamp(2.3rem, 3.4vw, 3.1rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  serif-title:
    fontFamily: "Instrument Serif, Times New Roman, Georgia, serif"
    fontSize: "1.9rem"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  beat:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  year:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.7rem, 2.6vw, 2.4rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "\"tnum\""
  lede:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.05rem, 1.3vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.6
  button:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  small:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"tnum\""
  caption:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  plate: "2px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  section-y: "clamp(80px, 11vw, 150px)"
  section-head: "clamp(36px, 5vw, 64px)"
  panel-gap: "28px"
  swipe-gap: "12px"
  bar: "64px"
  bar-mobile: "58px"
  container: "1320px"
components:
  button-plate:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.panel}"
    typography: "{typography.button}"
    rounded: "{rounded.plate}"
    padding: ".85rem 1.25rem"
    height: "44px"
  button-plate-hover:
    backgroundColor: "{colors.blue-deep}"
    textColor: "{colors.panel}"
  button-plate-small:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.panel}"
    rounded: "{rounded.plate}"
    padding: ".55rem .95rem"
    height: "40px"
  menu-button:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: ".5rem .9rem"
    height: "44px"
  field-input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: ".7rem .8rem"
    height: "46px"
  top-bar:
    backgroundColor: "{colors.hall}"
    textColor: "{colors.ink}"
    height: "64px"
  chapter-plate:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "1.6rem 1.7rem 1.5rem"
    width: "25rem"
  spec-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "1.2rem 1.3rem"
    width: "20rem"
  scale-tab:
    textColor: "{colors.ink-2}"
    typography: "{typography.small}"
    rounded: "{rounded.plate}"
    padding: ".5rem .8rem"
    height: "40px"
  scale-tab-current:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.panel}"
  sector-panel:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.plate}"
    width: "clamp(280px, 32vw, 520px)"
  sector-panel-wide:
    width: "clamp(320px, 52vw, 900px)"
  factory-chip:
    textColor: "{colors.on-ink}"
    typography: "{typography.small}"
    rounded: "{rounded.plate}"
    padding: ".35rem .65rem"
---

# Design System: AOKTAC

## Overview

**Creative North Star: "The Cleanroom"**

The page is a bottling hall: cool, bright and swept clean. A faintly blue-grey hall white is the ground, Aoktac blue is held back for what a buyer acts on or measures by, and everything else is navy ink divided by thin steel rules. Partway down, the page steps out of the hall twice, onto deep navy, for the two photographic chapters: the packaging sectors and the drive up to the Linhai factory. Components read like machine nameplates. They are white plates with 1px steel frames, 2px corners, tabular figures and solid blue plate buttons.

The voice is light. Inter at regular weight, tracked tight, carries every headline. Instrument Serif italic is the editorial counterpoint. It sets the key phrase inside a headline, the live size readout, the process chapter names and the small headings in history, service and the directory. The pairing was pinned by the user's brief. Photography and the films carry the color and warmth, so the chrome stays quiet. The one warm exception is the oven: amber appears only while the preform heats.

Motion belongs to the visitor's scroll. Each major chapter is a tall section with a pinned full-viewport stage. Scroll scrubs the process and factory films, grows the 3D bottle through five container sizes, and slides the sectors band sideways after a short hold. Captions fade in and lift into place within scripted windows. The only motion that runs on its own is the 3D bottle's slow turn and the scroll cue line, and the bottle stops turning under reduced motion.

**Key Characteristics:**
- Hall-white and panel-white light sections, with two navy chapters for the sectors band and the factory film.
- One accent, Aoktac blue, on light grounds. On navy the accent becomes PET blue or the pale on-ink accent, never Aoktac blue.
- Inter 400 headlines with tight negative tracking, and Instrument Serif italic for accent phrases, readouts and chapter names.
- Every corner is 2px and every border is 1px.
- Published figures in tabular numerals with units, and "On request" where a figure is not published.
- Pinned 100svh stages driven by scroll progress, each with a still or pre-rendered fallback.

## Colors

A cool, low-chroma hall palette with one working blue, a navy chapter ground with its own pale accents, and a single warm chapter accent for the oven.

### Primary
- **Aoktac Blue** (`blue`): the brand blue from the current site. It fills plate buttons, the current size tab and the skip link. It also colors serif accent phrases on light grounds, the showcase readout, the "Now" row of the timeline, links and the success status.
- **Deep Plate Blue** (`blue-deep`): the hover fill for plate buttons and the hover color for links. It never appears at rest.

### Secondary
- **Oven Amber** (`amber`): the infrared glow. It is used only as a radial wash rising from the bottom of the process film, peaking at the oven moment (`.film__heat`, 22% alpha, written as an rgba literal).
- **Fired Amber Ink** (`amber-ink`): text-weight amber for the spec values on the Heat plate. It is used nowhere else.

### Tertiary
- **PET Blue** (`pet`): the clear-plastic blue for the accent phrase in the sectors band title on navy.
- **On-Ink Accent** (`on-ink-accent`): a paler blue for serif accent phrases in the factory film beats.

### Neutral
- **Hall White** (`hall`): the page ground, the top bar, the process film and 3D showcase stages, the history and contact sections, and the mobile menu drawer.
- **Panel White** (`panel`): chapter plates, the spec card (at 90% over the stage), the quote form, fields, the menu button, and the service section ground.
- **Navy Ink** (`ink`): all text on light grounds, the focus outline, the 1px rule that opens ledger lists, and the ground of the sectors band and the factory chapter.
- **Slate Ink** (`ink-2`): ledes, supporting copy, spec labels, captions, credits, inactive size tabs, the field hover border, and the placeholder behind sector photos before they load.
- **Brushed Steel** (`steel`): the structural hairline, for dividers and frames only. It sits under the top bar, on top of sections, around plates, the spec card, the size-tab track and the quote form, and between timeline rows.
- **Steel Hairline** (`steel-2`): the quieter rule. It draws the chapter plate's inset second frame, the dividers inside spec lists, the divider between the bottle and machine slots, and the people-list rows.
- **Control Steel** (`steel-strong`): the control stroke. It is the 1px border on text inputs, selects, textareas and the menu button, at 3.49:1 against white.
- **Fog** (`fog`): the ground behind the factory poster and film before media paints.
- **On Ink** (`on-ink`): white text on navy, including sector words, factory beats, the factory chip outlines (at 50%) and the sectors progress bar.
- **On-Ink Slate** (`on-ink-2`): the sectors band lede on navy (11.4:1).
- **On-Ink Muted** (`on-ink-muted`): the factory disclosure note on its 60% navy backplate.
- **Selection** (`selection`): the text selection highlight.
- **Placeholder** (`placeholder`): field placeholder text (4.59:1 on white).
- **Error Red** (`error`): the invalid field border and error message text.

### Named Rules
**The Plate Blue Rule.** On light grounds, blue means "act on this" or "this is the figure that matters". It fills buttons and the current tab, and colors accent phrases and readouts. It is never a section background or a decorative band.

**The Oven Rule.** Amber belongs to the Heat chapter of the process film: the oven glow and the Heat plate's values. It appears nowhere else.

**The Two Grounds Rule.** Light sections use hall white or panel white and open on a 1px steel top rule. Navy is reserved for the two photographic chapters, sectors and factory. On navy, text is on-ink or on-ink-slate and accents are PET blue or on-ink accent.

**The Control Stroke Rule.** Anything a visitor types into, or the menu button, is outlined in control steel. Brushed steel is for dividers and frames only.

## Typography

**Display Font:** Inter (with Helvetica Neue, Helvetica, Arial)
**Body Font:** Inter
**Accent Font:** Instrument Serif italic (with Times New Roman, Georgia)

**Character:** A light, tightly tracked grotesque against a narrow italic serif. Inter at 400 keeps the headlines calm and engineered. The serif italic lands on the one phrase that carries the claim, like "100 ml to 30 L", "in Linhai" or "what you bottle", and on the numbers the visitor watches change. Inter loads at 300, 400, 500 and 600. Instrument Serif loads roman and italic, and only the italic is used.

### Hierarchy
- **Display** (Inter 400, clamp 2.7 to 5.6rem, 0.98, -0.045em): the hero headline only. Its accent phrase drops to its own line in serif italic at 1.08em, in blue.
- **Accent** (Instrument Serif italic 400, -0.01em): any `em` inside an h1, h2, h3 or paragraph. It inherits the size of its line. Blue on light grounds, PET blue or on-ink accent on navy.
- **Headline** (Inter 400, clamp 2.3 to 4.6rem, 1.02, -0.045em, max 16ch): section titles for history, service and contact. The sectors band title (clamp 2.4 to 4.6rem) and the factory title beat (clamp 2.6 to 5.6rem) use the same cut. The showcase title is smaller (clamp 2 to 3.4rem, -0.04em).
- **Sector Word** (Inter 500, clamp 4.5 to 11.5rem, 0.86, -0.06em): one word per sector panel, larger than the panel and pulled left by 0.42em so it crosses the panel edge into the gap. In the swipe row it drops to clamp 3 to 5rem with no overhang.
- **Readout** (Instrument Serif italic, clamp 3.6 to 6.4rem, 0.9, blue): the current container size in the 3D showcase.
- **Plate Title** (Instrument Serif italic, clamp 2.3 to 3.1rem): process chapter names (Heat, Stretch, Blow, Out at line speed).
- **Serif Title** (Instrument Serif italic, 1.9rem): service stage headings. Directory headings use 1.5rem, and the timeline's "Now" year is also set in it.
- **Beat** (Inter 400, clamp 1.5 to 2.4rem, 1.15, -0.03em): the factory film's timed statements.
- **Year** (Inter 300, clamp 1.7 to 2.4rem, -0.04em, tabular): timeline years.
- **Lede** (Inter 400, clamp 1.05 to 1.2rem, slate ink, max 40rem): the sentence under section titles. The hero lede is capped at 26rem.
- **Body** (Inter 400, 1.0625rem, 1.6): running text.
- **Label** (Inter 500, 0.9375rem): field labels, people names, sector notes and the spec card's model name (1.35rem). Nav links are 0.9375rem at 400.
- **Button** (Inter 500, 0.9375rem, -0.005em): plate buttons.
- **Small** (Inter 400, 0.875rem, tabular): spec rows, showcase dimensions, size tabs and factory chips.
- **Caption** (Inter 400, 0.75rem, 1.45): spec card labels, the 3D credit line and film disclosure notes.

### Named Rules
**The Light Voice Rule.** Headlines are Inter 400, or 300 for years, with tight negative tracking. Weight 500 is reserved for buttons, labels, figures and the sector words. Nothing is bold, uppercased or letter-spaced open.

**The Serif Accent Rule.** Instrument Serif italic marks the claim phrase inside a headline, the live readout, chapter names and small editorial headings. It never sets running text, labels, buttons or a whole section title.

**The Tabular Figures Rule.** Every published figure is set in tabular numerals and shown with its unit. This covers plate spec values, showcase dimensions and facts, size tabs, timeline years and figures, and phone numbers.

## Layout

The page is a sequence of pinned stages followed by conventional sections.

**Pinned stages.** Each scroll chapter is a tall section with a sticky stage of 100vh / 100svh and hidden overflow. Scroll progress through the section drives the stage.
- **Process film:** 760vh (680vh at 760px and below). The hero sits in the left third, min(36rem, 42vw), dropped below the bar by clamp(32px, 11vh, 140px). A hall-white wash, 90% fading to clear by 56%, keeps the hero readable and fades out as the film starts. On phones the wash runs top to bottom. Chapter plates sit bottom-left. The disclosure note is pinned bottom-left, and the scroll cue sits bottom-center.
- **3D showcase:** 300vh (260vh on tablet portrait and phone). On computers the bottle viewport sits left and the machine photo right in a 1 : 1.3 grid separated by a steel-2 rule; the bottle viewport starts below the title and lede and ends above the serif readout (bottom-left), so the 30 L bottle never runs behind text. The spec card is bottom-right and the size tabs bottom-center. On tablet portrait and phones the stage is one column sized to the visible screen (100lvh minus the toolbar): title (the lede drops on screens under 640px tall), the readout with its dimensions on one line, then the bottle and machine side by side sharing whatever height is left, then the spec card and the full-width tabs. Phones held sideways put the bottle and machine on the left and everything else in a column on the right. Every part stays inside the visible screen with no overlaps from a 375x553 iPhone SE to a 2560px desktop (checked at all five sizes).
- **Sectors band:** navy. Its height is computed from the track width, and the band holds on the intro for the first 8% before the row translates sideways. Panels are 28px apart, standard width clamp(280px, 32vw, 520px), wide clamp(320px, 52vw, 900px), alternating wide and standard. A 1px progress line runs along the bottom.
- **Factory film:** 420vh (300vh on narrow screens), navy. Four text beats stack bottom-left (max 44rem) over a navy gradient rising from the bottom.

**Sections.** History, service and contact use padding of clamp(80px, 11vw, 150px) by the gutter, content capped at 1320px, and a section head separated from its content by clamp(36px, 5vw, 64px). Grids are asymmetric: contact is 7:4 and the timeline is 9rem / fluid / 16rem. Service is three equal stages divided by steel rules. `html` sets `overflow-anchor: none` so pinned stages do not jump when content above them changes size.

**Responsive steps:**
- **Height 780px and below on desktop:** the spec card tightens.
- **1100px:** the nav folds into a Menu drawer.
- **900px, or portrait up to 1100px:** the showcase stacks, the sectors band becomes a native swipe row, and the factory film shortens.
- **900px:** contact, service and the timeline stack.
- **760px:** the bar drops to 58px, the bar quote button moves into the drawer, the film wash turns vertical, and the quote rows go single-column.

### Named Rules
**The Pinned Stage Rule.** A chapter that moves is a tall section with a sticky 100svh stage. Scroll position, not elapsed time, sets where it is. Every stage has a static fallback.

**The Ledger Rule.** Lists of facts, such as the timeline, service stages, plate specs and people, open on a 1px rule and divide rows with hairlines. They are never set as cards.

## Elevation & Depth

The system is flat and layered by tone. Depth comes from the hall and panel whites, the steel hairlines, and the step down onto navy. Real depth lives inside the media: the films, and the 3D scene, which uses ACES tone mapping, a room environment map and soft radial contact shadows under the bottle and machine. CSS shadows are rare and soft. Only the chapter plates floating over the film, the mobile menu drawer and the sector words carry one, and none is a hard offset.

### Shadow Vocabulary
- **Chapter plate frame** (`box-shadow: inset 0 0 0 5px #FFFFFF, inset 0 0 0 6px #E2E8ED, 0 10px 24px -18px rgba(11, 30, 51, .35)`): process chapter plates over the film. The inset pair draws a second steel-2 frame 5px inside the steel border.
- **Drawer drop** (`box-shadow: 0 18px 30px -24px rgba(11, 30, 51, .5)`): the mobile nav drawer.
- **Sector word lift** (`text-shadow: 0 2px 30px rgba(11, 30, 51, .25)`): keeps the oversized white sector words legible where they cross bright photo areas.
- **Field focus ring** (`box-shadow: 0 0 0 3px rgba(0, 74, 145, .22)`): focused text fields, together with a blue border.

### Named Rules
**The Nameplate Frame Rule.** A plate floating over the film gets a 1px steel border, an inner steel-2 rule 5px inside, and a soft navy drop. The showcase spec card keeps the single steel frame on 90% white, with no drop.

## Shapes

Every corner is 2px. That covers buttons, fields, the menu button, chapter plates, the spec card, the size-tab track and tabs, sector media, factory chips, film note backplates and the skip link. There are no pills, circles or large radii. Borders are always 1px:
- brushed steel for frames and dividers
- control steel for fields and the menu button
- blue for an open menu or a focused field
- 50% white for factory chips on navy

Labels laid over moving media sit on translucent backplates with the same corners: 86% white over the process film, 60% navy over the factory film. The scroll cue is a 1px navy line that draws downward and fades. The 3D bottle is a lathe profile with a petaloid base, grip grooves or ribs, and a threaded neck, rendered as clear PET with Fresnel-weighted edges.

### Named Rules
**The Two Pixel Rule.** Corners are 2px everywhere. A rounder corner breaks the stamped-metal read.

## Components

### Buttons
Solid, flat blue plates.
- **Shape:** 2px corners, at least 44px tall.
- **Plate (primary):** blue fill, white Inter 500 at 0.9375rem, padding .85rem by 1.25rem, an inline-flex row with a .55em gap.
- **Hover / Focus / Active:** the fill moves to deep plate blue over 0.2s. Focus is the global 3px navy outline at a 3px offset. On press the button moves down 1px on the out-expo curve.
- **Small plate:** .55rem by .95rem, at least 40px tall, used in the top bar. Below 760px it is replaced by a full-width plate inside the drawer.
- **Menu button:** panel white with a 1px control-steel border, at least 44px tall. When expanded, the border and text turn blue.

### Size Tabs
- **Style:** a segmented track of five tabs (0.6 L, 2 L, 5 L, 20 L, 30 L) on 90% white, with a 1px steel frame and .25rem inner padding. Tabs are borderless slate text at 0.875rem with tabular figures, at least 40px tall.
- **State:** hover turns the text blue. The current tab is white on blue and carries `aria-current="step"`. Clicking a tab scrolls to that size's hold point. The tab state follows the scroll, not the other way round.

### Cards / Containers
- **Chapter plate:** panel white, the chapter plate frame, padding 1.6rem by 1.7rem, at most 25rem wide. It holds a serif italic chapter name, a slate sentence, and a spec ledger with steel-2 rules and tabular values. On the Heat plate the values are amber ink. Plates fade in and lift 14px within their film time window.
- **Spec card (showcase nameplate):** 90% white, 1px steel frame, 2px corners, padding 1.2rem by 1.3rem, at most 20rem wide. It shows the model name (Inter 500, 1.35rem), a two-up facts ledger (cavities and rated output, caption labels over tabular values) under a steel-2 rule, a plate "Request a quote" button that pre-fills the quote form, and a caption credit naming the machine pictured (and, where the photo is not the model in the card, saying so) and stating the photo is not to scale with the bottle. On narrow screens it becomes a two-column strip with the button top-right.
- **Quote form panel:** panel white, 1px steel frame, 2px corners, padding clamp(18px, 3vw, 36px), on the hall-white contact section.

### Inputs / Fields
- **Style:** panel white, 1px control-steel border, 2px corners, padding .7rem by .8rem, at least 46px tall, 1rem text. Labels sit above at 500. Optional fields carry a 400-weight slate "optional" suffix. Placeholders use the placeholder token.
- **Hover:** the border darkens to slate ink.
- **Focus:** the border turns blue and the 3px blue focus ring appears. The outline is suppressed in favor of the ring.
- **Error:** an error-red border, and a 0.875rem error message under the field.

### Navigation
- **Top bar:** fixed and hall white, with a 1px steel bottom rule. It holds the raster AOKTAC wordmark (24px, 19px on phones), six text links at 0.9375rem and 400 in navy that turn blue on hover, and a small plate "Request a quote". Every link on the page is an in-page anchor; contact details are plain text.
- **Mobile (1100px and below):** a Menu button opens a full-width hall-white drawer of stacked 1.0625rem links with steel-2 dividers and the drawer drop. Escape closes it and returns focus to the button.

### Bottle and Machine Showcase (signature)
On tablets and computers a Three.js canvas renders a clear PET bottle in a studio viewport. Phones show five stills rendered from the same scene at 1050x1350 (source/render-bottles.html), stacked and dissolved from one size to the next on the bottle's morph curve: the glass shaders would cost a phone GPU a long first compile and a refraction pass on every reshape. In a viewport wider than the stills they are fitted whole over a matching backdrop gradient, so the 30 L cap is never cropped. Where the browser can draw WebGL off the page (OffscreenCanvas), the bottle runs in a worker, so its setup, shader compiles, reshapes and draws never share a thread with scrolling; elsewhere the same module runs on the page. It is built only while the visitor is not scrolling (600 ms without scroll, wheel, touch or key input), because compiling the glass shaders keeps the GPU busy for a few hundred milliseconds; until then the pre-rendered bottle images stand in. Beside it, the machine panel shows Aoktac's own cut-out machine photography, one photo per size, standing on one floor line over a CSS studio sweep that matches the bottle's backdrop, with a soft contact shadow; photos use `object-fit: contain` so no machine is cropped or stretched. One scroll moves one size. The scroll position only selects the nearest of the five published container sizes; the bottle reshape and machine photo change then animate to it over about half a second, so the section never rests between sizes. On desktop, while the section is pinned, each wheel or trackpad gesture steps exactly one size (the rest of the gesture is absorbed) and a gesture at the first or last size scrolls the page on. On touch screens sizes are 40% of a screen apart and a swipe that comes to rest inside the section glides to the nearest size. The section is 300vh on desktop and 260vh on phones. The WebGL canvas sits inside the bottle slot only, and on touch devices the bottle has no idle spin and is drawn only when it changes. On phones the hero film runs over 520vh and the factory film over 250vh; sector and machine photos have 900px and 800px versions picked on phones. The machine photos are driven by the same stage value and morph curve: the outgoing photo clears over the first half of the morph and drifts 3% left, the next arrives over the second half from 3% right, so two cut-outs never show through each other. On fine pointers the bottle follows the cursor. When the size changes, the serif readout and model name refresh with a 380ms rise on the out-expo curve. Without WebGL (`.show.no-webgl`), pre-rendered bottle images fill the bottle slot; the machine photos are unaffected.

### Sectors Band (signature)
On navy, an intro panel (headline with a PET-blue serif accent and an on-ink-slate lede) leads a row of six photo panels. Every panel has one fixed portrait shape, width:height 0.783 (900 x 1150 at full size), sized from the available height on wide screens and from 84vw (max 620px) in the swipe row, so the photo crop is the same on every screen, browser and zoom level. Each panel is a size container: the sector word is 16.67cqw (150px on a full-size card), the inset 4cqw (14 to 36px) and the material note 1.78cqw (14 to 16px), so type and photo keep the same proportions at any size. Each panel has a slate placeholder ground and a photo bled 4% past its edges. A navy gradient sits top and bottom, with the white sector word in the top-left corner and the 500-weight material note at the bottom left. On wide screens the row holds, then translates with scroll. Each photo drifts against its panel by up to 2.7% of the card width as it crosses the screen and shifts up to 2.5% by 1.5% toward the cursor (0.6s, out-expo), always inside its bleed. The swipe variant (`.hz.is-swipe`, used for phones, portrait tablets and reduced motion) lifts the intro above a native scroll-snap row, 12px apart, with the progress line following horizontal scroll.

### Factory Film (signature)
A scroll-scrubbed approach to the Linhai factory on navy, with a still poster (and a portrait poster) until the film loads. Four beats fade in turn and lift 22px: the title with an on-ink-accent serif phrase, two statements, and the ISO line followed by an equipment chip list. The chips are 0.875rem white text in 1px 50%-white frames with 2px corners, and they are labels, not buttons. A disclosure note, "generated from a photo of the site", stays pinned bottom-left.

### Process Film (signature)
The scroll-scrubbed opening. Five still frames crossfade over 0.35s until a coarse image sequence is ready (every 16th, then every 8th frame, a few hundred KB), drawn cover-fit on a canvas, always the nearest real frame and never a blend. The full-quality film is then scrubbed as video, the way Apple's product pages do it: a keyframe every 3 frames and no B-frames, so each seek decodes at most two frames on the video hardware; HEVC on Safari, H.264 elsewhere; 1920x1080 on landscape screens and an 810x1440 portrait cut that already follows the action on phones. The video takes over at the same moment of the film once it has fully downloaded (held in memory as a blob where the browser allows it; Safari plays it from its fully cached URL), and a seek is issued only when the picture would change. The video must prove itself on each device: if the typical one of its first 16 seeks takes over 50 ms, or the page frame time while seeking is over 34 ms, the film goes back to the image sequence, which then downloads in full. On touch screens the film follows the finger directly; on desktop it catches up in about 50 ms. Only frames near the position are decoded, ahead of the scroll direction, off the main thread. Touch devices keep native scrolling (no smooth-scroll layer). Pinned stages are 100lvh (the full screen with the mobile toolbar hidden) and bottom-anchored captions add --tb (100lvh - 100svh) so the toolbar never covers them; scroll maths uses that one stable height and ignores toolbar-only resizes. The factory film uses the same player. An amber glow rises at the oven moment. On portrait screens the frame's horizontal focus follows the action. Reduced-motion and save-data visitors get the stills only.

## Do's and Don'ts

### Do:
- **Do** set headlines in Inter 400 with tight tracking, and put the one claim phrase in Instrument Serif italic.
- **Do** keep Aoktac blue for actions, the current state, readouts and accent phrases on light grounds.
- **Do** switch accents to PET blue or on-ink accent when the ground is navy.
- **Do** confine amber to the Heat chapter: the oven glow and the Heat plate's values.
- **Do** outline fields and the menu button in control steel, and keep brushed steel for dividers and frames.
- **Do** set every corner at 2px and every border at 1px.
- **Do** build moving chapters as pinned 100svh stages driven by scroll progress, each with a still or pre-rendered fallback.
- **Do** label generated films and the 3D bottle as visualizations on the stage itself, and name the machine in every photo.
- **Do** set every published figure in tabular numerals with its unit, and write "On request" where a figure is not published.

### Don't:
- **Don't** use bold, uppercase or letter-spaced-open type. Weight 500 is the heaviest in use.
- **Don't** set running text, buttons, labels or table figures in the serif.
- **Don't** use Aoktac blue as a text accent on navy, or fill a light section with blue.
- **Don't** use rounded pills, circles or radii larger than 2px.
- **Don't** use hard offset shadows. Depth comes from tone, hairlines and the media.
- **Don't** lay out facts as card grids. Use ledgers with a rule on top and hairlines between rows.
- **Don't** let a scroll chapter run on a timer. Only the 3D idle turn and the scroll cue move on their own, and the turn stops under reduced motion.


**Performance readout.** Adding `?perf` to the address shows a small panel with the live frame rate, dropped frames, the page's own work per frame, how far each film trails the scroll, and which player each film and the bottle are using. It exists to check real devices and is never shown otherwise.