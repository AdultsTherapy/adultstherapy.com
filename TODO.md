# TODO List for Adults and Couples Therapy of Oregon

## Priority 0: Urgent Business Updates

### Insurance Information Update
1. [x] Update insurance companies accepted across all pages
   1. [x] Remove Pacific Source (denied coverage)
   2. [x] Confirm and update with current accepted insurances:
     1. CIGNA
     2. Moda
     3. Cascade Health Alliance (CHA)
     4. TriWest
     5. Atrio
     6. Other current accepted insurances

   Confirm that the following pages are updated:
   3. [x] index.html (Adults and Couples Therapy of Oregon)
   4. [x] about/index.html (About)
   5. [x] Any other pages with insurance information (therapy/eft/index.html, therapy/talk-therapy/index.html)

### Service Area Update - Pacific Source Insurance Limitation
2. [x] Remove Bend, Oregon from service areas due to Pacific Source insurance denial
   1. [x] Update index.html - Remove Bend from Regional Centers list
   2. [x] Update about/index.html - Remove Bend from Central Oregon service area
   3. [ ] Consider if other Central Oregon areas (Redmond, Sisters, La Pine) should also be removed if they primarily use Pacific Source
      - **DECISION NEEDED**: Research required to determine primary insurance providers in Redmond, Sisters, and La Pine
      - **Current Central Oregon areas listed**: Redmond, Sisters, and La Pine
      - **Recommendation**: Contact local healthcare providers or insurance brokers in these areas to determine:
        * Primary insurance companies used by residents
        * Whether Pacific Source is a major provider in these communities
        * Alternative insurance options available to residents
      - **Action**: If Pacific Source is the primary insurance in these areas, consider removing them to avoid service area conflicts

## Priority 1: High-Traffic Page Optimizations

### Header (Sitewide)

1. [x] Update main heading to "Adults and Couples Therapy of Oregon: Evidence-Based"
2. [x] Add keyword-rich subtitle: "Specialized treatment for depression, anxiety, and relationship issues with proven therapeutic approaches"
Pages:
1. [x] index.html (Adults and Couples Therapy of Oregon)
2. [x] about/index.html (About)
3. [x] education/index.html (Education)
4. [x] privacy/index.html (Privacy)
5. [x] sitemap/index.html (Sitemap)
6. [x] skills/index.html (Skills)
7. [x] terms/index.html (Terms)
8. [x] therapy/index.html (Therapy)
9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
12. [x] therapy/military/index.html (Military)
13. [x] therapy/mindfulness/index.html (Mindfulness)
14. [x] therapy/talk-therapy/index.html (Talk Therapy)
   - *These changes have been implemented across all pages of the site*

### Homepage
3. [x] Add structured data markup for local therapy business
4. [x] Ensure meta description includes primary keywords and a call to action

### Gottman Therapy Page (Highest Traffic)
5. [x] Rename page title to "Gottman Method Couples Therapy | Evidence-Based Relationship Counseling"
6. [x] Expand content to 1000+ words with comprehensive information about:
  - [x] Gottman techniques and principles
  - [x] Success rates and research backing
  - [x] Specific relationship problems addressed
7. [x] Add naturally placed phrases like "gottman couples therapy session" and "evidence-based couples counseling"
8. [x] Create FAQ section answering common questions evident in search data:
  - [x] "What is Gottman couples therapy?"
  - [x] "Is Gottman method evidence-based?"
  - [x] "How does couples therapy help relationships?"

### About Page (Second Highest Traffic)
9. [x] Update title to "About Elaine Dinwiddie | Licensed Gottman Therapist in Oregon"
10. [x] Enhance professional credentials section with more details about:
  - [x] Gottman training and certification specifics
  - [x] EMDR and trauma qualification details
  - [x] Years of experience and specializations
11. [ ] Add anonymized case studies demonstrating successful therapy outcomes - SKIP THIS FOR NOW
12. [x] Include more location-specific information

## Priority 1.5: Navigation, Templating, and Link Fixes

### Navigation & Page Content
- [x] Add "Emotional Freedom Technique" to the main navigation menu under the "Therapy" dropdown on all pages.

### Link Behavior - SKIP FOR NOW
- [ ] Ensure all internal links on the preview site point to preview URLs, not production. Review and fix the existing script or implement a more robust solution.

### Code Refactoring & Templating - SKIP FOR NOW
- [ ] Convert header (including navigation and breadcrumbs) and footer into JavaScript-loaded templates.
  - [ ] Create `templates/header.html` and `templates/footer.html`.
  - [ ] Write a script (`template-loader.js`) to fetch and inject templates into all pages.
  - [ ] Update all pages to remove hardcoded header/footer and use the new script.

## Priority 2: Content Improvements

### Therapy Pages
13. [x] Create dedicated content addressing the search query: "When 'the positive perspective' is present in a couple's relationship, what can that help the therapist determine about the couple's relationship?"
14. [x] Expand content on Talk Therapy page (currently getting moderate traffic)
15. [x] Enhance CBT and DBT pages with more comprehensive information
16. [x] Add internal links between related therapy approaches

### Skills Section
17. [x] Restructure to target keyword "therapy skills for adults" 
18. [x] Add more actionable content that visitors can implement

### Military Page
19. [x] Enhance with specific information about trauma-informed approaches for veterans
20. [x] Include relevant keywords related to military personnel and trauma

### EFT Content Integration
- [x] Add Emotional Freedom Technique (EFT) certification and content across the site.
  - *Details: Updated homepage, about, therapy, and skills pages. Created a new dedicated page at `therapy/eft/index.html`. Updated sitewide header and structured data.*

## Priority 3: Technical SEO Improvements

### Metadata
21. [x] Review and update all page titles to be unique and under 60 characters
Pages:
1. [x] index.html (Adults and Couples Therapy of Oregon)
2. [x] about/index.html (About)
3. [x] education/index.html (Education)
4. [x] privacy/index.html (Privacy)
5. [x] sitemap/index.html (Sitemap)
6. [x] skills/index.html (Skills)
7. [x] terms/index.html (Terms)
8. [x] therapy/index.html (Therapy)
9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
12. [x] therapy/military/index.html (Military)
13. [x] therapy/mindfulness/index.html (Mindfulness)
14. [x] therapy/talk-therapy/index.html (Talk Therapy)

22. [x] Create compelling meta descriptions (150-160 characters) for all pages
Pages:
1. [x] index.html (Adults and Couples Therapy of Oregon)
2. [x] about/index.html (About)
3. [x] education/index.html (Education)
4. [x] privacy/index.html (Privacy)
5. [x] sitemap/index.html (Sitemap)
6. [x] skills/index.html (Skills)
7. [x] terms/index.html (Terms)
8. [x] therapy/index.html (Therapy)
9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
12. [x] therapy/military/index.html (Military)
13. [x] therapy/mindfulness/index.html (Mindfulness)
14. [x] therapy/talk-therapy/index.html (Talk Therapy)

23. [x] Implement schema markup for:
  - [x] Therapist information
  - [x] Local business details
  - [x] Service offerings
Pages:
1. [x] index.html (Adults and Couples Therapy of Oregon)
2. [x] about/index.html (About)
3. [x] education/index.html (Education)
4. [x] privacy/index.html (Privacy)
5. [x] sitemap/index.html (Sitemap)
6. [x] skills/index.html (Skills)
7. [x] terms/index.html (Terms)
8. [x] therapy/index.html (Therapy)
9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
12. [x] therapy/military/index.html (Military)
13. [x] therapy/mindfulness/index.html (Mindfulness)
14. [x] therapy/talk-therapy/index.html (Talk Therapy)

### Website Structure
24. [x] Add breadcrumb navigation on all pages
  Pages:
  1. [x] index.html (Adults and Couples Therapy of Oregon)
  2. [x] about/index.html (About)
  3. [x] education/index.html (Education)
  4. [x] privacy/index.html (Privacy)
  5. [x] sitemap/index.html (Sitemap)
  6. [x] skills/index.html (Skills)
  7. [x] terms/index.html (Terms)
  8. [x] therapy/index.html (Therapy)
  9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
  10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
  11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
  12. [x] therapy/military/index.html (Military)
  13. [x] therapy/mindfulness/index.html (Mindfulness)
  14. [x] therapy/talk-therapy/index.html (Talk Therapy)

### Content Strategy
25. [x] Add location-specific content for surrounding areas in Oregon

## Priority 4: Conversion Optimization

26. [x] Add clear calls-to-action on all high-traffic pages
27. [x] Create a dedicated contact/booking content with structured data on the About page
28. [ ] Add testimonials throughout the site (anonymized) - SKIP THIS FOR NOW
29. [ ] Remove American Psychological Association (APA) membership references from all pages, including:
  1. [x] Remove American Psychological Association (APA) logo and member text from footer on all HTML pages
    Pages:
    1. [x] index.html (Adults and Couples Therapy of Oregon)
    2. [x] about/index.html (About)
    3. [x] education/index.html (Education)
    4. [x] privacy/index.html (Privacy)
    5. [x] sitemap/index.html (Sitemap)
    6. [x] skills/index.html (Skills)
    7. [x] terms/index.html (Terms)
    8. [x] therapy/index.html (Therapy)
    9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
    10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
    11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
    12. [x] therapy/military/index.html (Military)
    13. [x] therapy/mindfulness/index.html (Mindfulness)
    14. [x] therapy/talk-therapy/index.html (Talk Therapy)
  2. [x] Remove American Psychological Association (APA) references from schema data in all pages
    Pages:
    1. [x] index.html (Adults and Couples Therapy of Oregon)
    2. [x] about/index.html (About)
    3. [x] education/index.html (Education)
    4. [x] privacy/index.html (Privacy)
    5. [x] sitemap/index.html (Sitemap)
    6. [x] skills/index.html (Skills)
    7. [x] terms/index.html (Terms)
    8. [x] therapy/index.html (Therapy)
    9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
    10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
    11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
    12. [x] therapy/military/index.html (Military)
    13. [x] therapy/mindfulness/index.html (Mindfulness)
    14. [x] therapy/talk-therapy/index.html (Talk Therapy)
  3. [x] Update README.md to remove APA membership reference

## Priority 5: Visual Design Improvements

### 5.0.1 Design References:
- openpathcollective.org
- rowiteen.com
- lincolnparktherapygroup.com
- therapyrising.com

### Layout and Structure
30. [ ] Add more whitespace between sections to improve readability - skip for now
31. [ ] Implement consistent content width across all pages - skip for now
32. [ ] Break up large text blocks into smaller, more digestible sections - skip for now
33. [ ] Create more distinct visual hierarchy on all pages - skip for now

### Navigation Enhancement
34. [ ] Make dropdown menus more visually distinctive with subtle animations
  1. [x] create a style.css
  2. [x] create a script.js
  3. [x] create a link tag and script tag in the head section of all pages
    Pages:
    1. [x] index.html (Adults and Couples Therapy of Oregon)
    2. [x] about/index.html (About)
    3. [x] education/index.html (Education)
    4. [x] privacy/index.html (Privacy)
    5. [x] sitemap/index.html (Sitemap)
    6. [x] skills/index.html (Skills)
    7. [x] terms/index.html (Terms)
    8. [x] therapy/index.html (Therapy)
    9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
    10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
    11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
    12. [x] therapy/military/index.html (Military)
    13. [x] therapy/mindfulness/index.html (Mindfulness)
    14. [x] therapy/talk-therapy/index.html (Talk Therapy)
35. [x] Add visual indicators for current page in navigation
36. [ ] Consider implementing a sticky header on scroll - save for later

### Color and Typography
37. [ ] Create more cohesive application of purple (#7e679b) and blue (#99b4df) color scheme - SKIP
38. [ ] Add complementary accent color for calls-to-action - SKIP for now
39. [ ] Ensure sufficient color contrast for accessibility - SKIP
40. [ ] Increase line spacing in paragraph text - SKIP
41. [ ] Create more dramatic contrast between heading and body text sizes - SKIP

### Visual Elements
42. [ ] Add appropriate therapy-related imagery throughout the site; use Unsplash images: example: https://images.unsplash.com/photo-1508962914676-134849a727f0

```
<img src="https://images.unsplash.com/photo-1508962914676-134849a727f0" alt="Saving time" class="feature-image">
```
make sure to check the image url before applying them that they do not produce 404 errors- you can use curl for this
and do not add parameters to the image url
dont reuse images that have already been used in the site

Please make sure that the image applies to the exact section that it placed in. Read the content of the page and the section that the image is in to make sure that it is appropriate. Dont think physician or surgeon or dentist, think therapist or counselor.

Follow the image styling on the other pages to make sure that image look correct and fit on the page.

Please distribute the images evenly down the pages.

    Pages:
    1. [x] index.html (Adults and Couples Therapy of Oregon)
    2. [x] about/index.html (About)
    3. [x] education/index.html (Education)
    4. [ ] privacy/index.html (Privacy) - SKIP
    5. [ ] sitemap/index.html (Sitemap) - SKIP
    6. [x] skills/index.html (Skills)
    7. [ ] terms/index.html (Terms) - SKIP
    8. [x] therapy/index.html (Therapy)
    9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
    10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
    11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
    12. [x] therapy/military/index.html (Military)
    13. [x] therapy/mindfulness/index.html (Mindfulness)
    14. [x] therapy/talk-therapy/index.html (Talk Therapy)
    15. [x] therapy/eft/index.html (Emotional Freedom Technique)

https://stock.adobe.com/search/free
**Note: Don't reuse images that have already been used elsewhere on the site**

43. [x] Implement subtle background patterns in header/footer areas
44. [ ] Add professional headshot with consistent styling across pages
45. [x] Create visual icons for different therapy modalities (use fontawesome.com)
46. [x] Add visual dividers between content sections
    Pages:
    1. [x] index.html (Adults and Couples Therapy of Oregon)
    2. [x] about/index.html (About)
    3. [x] education/index.html (Education)
    4. [ ] privacy/index.html (Privacy)
    5. [ ] sitemap/index.html (Sitemap)
    6. [x] skills/index.html (Skills)
    7. [ ] terms/index.html (Terms)
    8. [x] therapy/index.html (Therapy)
    9. [x] therapy/cbt/index.html (Cognitive Behavioral Therapy)
    10. [x] therapy/dbt/index.html (Dialectical Behavior Therapy)
    11. [x] therapy/gottman/index.html (Gottman's Couple Therapy)
    12. [x] therapy/military/index.html (Military)
    13. [x] therapy/mindfulness/index.html (Mindfulness)
    14. [x] therapy/talk-therapy/index.html (Talk Therapy)
    15. [x] therapy/eft/index.html (Emotional Freedom Technique)

### Page-Specific Design
47. [x] Homepage: Create impactful hero section with background image
48. [x] Homepage: Add visual cards for each therapy approach with icons
49. [ ] Homepage: Implement testimonial carousel with subtle styling
50. [ ] Therapy Pages: Create consistent visual templates for all modality pages
51. [ ] Therapy Pages: Add relevant imagery for each approach
52. [ ] About Page: Enhance professional photo presentation
53. [ ] About Page: Create visual timeline showing education/certification journey
54. [ ] About Page: Add visual elements to highlight professional affiliations

### Functional Design
55. [x] Make phone/email buttons more prominent with complementary colors
56. [x] Add floating contact button for accessibility
57. [x] Optimize image sizes for faster loading

## Priority 6: Ad Copy & Content Optimization

### High-Converting Language
58. [x] Incorporate high-performing words in headings and CTAs: "your," "free," "now," "get," "save"
59. [x] Use second-person pronouns ("you," "your") throughout copy to speak directly to visitors
60. [x] Focus on positive sentiment in copy (benefits gained) rather than negative (problems avoided)
61. [x] Implement strong action verbs like "get," "find," "discover" in calls-to-action
62. [x] Create urgency with words like "now" and time-sensitive language

### Readability Improvements
63. [x] Simplify content to approximately 9th grade reading level (14-year-old comprehension)
64. [x] Break long sentences into shorter, more digestible ones
65. [x] Use bullet points to highlight key benefits and services
66. [x] Implement strategic use of exclamation points (the highest-performing punctuation)
67. [x] Ensure good lexical diversity (avoid keyword stuffing and repetition)

### Emotional Appeal
68. [x] Add benefit-focused subheadings that address emotional needs
69. [x] Create clear value propositions for each therapy service
70. [x] Incorporate "power words" that trigger emotional responses
71. [ ] Use the PAS formula (Problem-Agitate-Solution) in key content sections
72. [ ] Include social proof elements (credentials, testimonials, success statistics)

### Content Structure
73. [x] Make copy scannable with descriptive subheadings
74. [ ] Use the "Bucket Brigade" technique to keep readers engaged
75. [ ] Implement strategic use of numbers (only when they add value)
76. [x] Create compelling FAQ content with conversational questions
77. [x] Follow the AIDA formula (Attention, Interest, Desire, Action) for key landing pages
