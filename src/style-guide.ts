/**
 * @guiridinnerdates voice & style guide.
 * Embedded from PRD-20260414-instagram-guiridinnerdates.
 * This is the single source of truth for caption generation.
 */

export const STYLE_GUIDE = `# @guiridinnerdates — Voice & Style Guide

## Account
American in BCN 🇺🇸 -> 🇪🇸 / 🍷 Chasing flavors across cities & countries / ⭐ Honest restaurant ratings everywhere I land

## Tone
- **First person**, personal and warm — "I had", "we shared", "I absolutely loved it"
- **Enthusiastic but honest** — genuine excitement, never fake or forced
- **Storytelling** — weaves in restaurant history, chef backgrounds, neighborhood context
- **Conversational** — reads like telling a friend about a great meal
- **Recommending, not reviewing** — "Would I recommend it? Absolutely" rather than star ratings

## Caption Structure
1. **Title line**: Emoji + "Guiri [Meal Type] Date at [Restaurant] – [City]" + flag emoji
2. **Branded tag**: \`#GuiriDinnerDates\` on a separate line
3. **Opening hook**: one sentence setting the scene
4. **Story body**: 2-4 paragraphs covering atmosphere, food ordered, standout dishes, context/history
5. **Closing thought**: personal recommendation or reflection
6. **Hashtag block**: branded + location + food-specific tags

## Meal Type Naming
| Meal | Format |
|------|--------|
| Dinner | "Guiri Dinner Date at [Restaurant]" |
| Brunch | "Guiri Brunch Date at [Restaurant]" |
| Breakfast | "Guiri Breakfast Date at [Restaurant]" |
| Street food / market | "Guiri Dinner Date – [Theme] Edition" |
| Travel teaser | "Guiri goes to [City]" |

## Hashtag Strategy

**Always include:**
- \`#GuiriDinnerDates\` (primary branded tag)

**Location tags** (pick applicable):
- \`#GuiriIn[City]\` (e.g., \`#GuiriInBarcelona\`, \`#GuiriInLondon\`)
- \`#GuiriIn[Country]\` (e.g., \`#GuiriInScotland\`)
- \`#[City]Eats\` (e.g., \`#EdinburghEats\`)
- \`#[City]Dining\` (e.g., \`#LondonDining\`)

**Food/theme tags** (pick 2-4 relevant):
- Specific to the meal: \`#SmallPlates\`, \`#BoneMarrowClub\`, \`#FullEnglishBreakfast\`
- Style: \`#FoodToShare\`, \`#FestiveEats\`, \`#MulledWineSeason\`
- Branded variants: \`#GuiriBrunchDate\`, \`#GuiriBreakfastDate\`

**Target**: 6-10 hashtags per post. Never exceed 15.

## Post Types
| Type | Description | Caption Approach |
|------|-------------|-----------------|
| **Carousel** | Multiple food/ambiance photos from one visit | Full storytelling caption, each dish mentioned |
| **Single image** | One standout photo | Shorter caption, focused on one moment or dish |
| **Travel teaser** | Arriving in a new city | Short hype post, city introduction |
| **Theme edition** | Markets, festivals, multi-stop tours | Longer recap, multiple locations/dishes |
| **Reels** | Short video of food/ambiance | Brief caption, heavier on hashtags |

## What to AVOID
- Corporate/influencer speak ("collab", "swipe up", "link in bio")
- Emoji spam — use 1-3 emojis in title line, sparingly in body
- Generic food descriptions ("delicious", "amazing" without specifics)
- Star ratings or numerical scores
- Negative reviews — if the experience wasn't good, don't post about it
- Captions under 100 words — the account's identity is storytelling
- **First names** — never use real names in captions. Use "she", "he", "we", "my girlfriend", etc.
- **Photo descriptions** — focus on taste, quality, and experience, NOT visual appearance of the food

## Content Focus
- Emphasize **food quality** over appearance
- Describe **flavors, textures, and cooking technique** rather than how dishes look
- Share the **story** behind the restaurant, chef, or neighborhood
- Include **practical details**: what to order, what to skip, insider tips
`;

/** Nextcloud base path for all guiri dinner dates content */
export const GUIRI_BASE_PATH = "/Shared/Guiri Dinner Dates";
