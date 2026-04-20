const chapter005 = {
  id: 'chapter-5',
  number: 5,
  title: 'Advanced Techniques',
  subtitle: 'Fingerstyle & Theory',
  description: 'Master fingerstyle playing, advanced chords, and music theory to become a complete guitarist.',
  color: '#ec4899',
  requiredLevel: 5,
  lessons: [
  {
    id: 'c5-l1',
    number: 1,
    title: 'Introduction to Fingerstyle',
    type: 'text',
    content: `Fingerstyle guitar means using your fingers instead of a pick. It opens up a world of possibilities!

**Why Fingerstyle?**
- Play melody, harmony, and bass simultaneously
- Softer, more intimate tone
- Essential for classical, folk, and acoustic styles
- Adds variety to your playing

**The Finger Names:**
- **p** = thumb (pulgar)
- **i** = index finger (indice)
- **m** = middle finger (medio)
- **a** = ring finger (anular)

**Thumb Position:**
- Rest on the Low E, A, or D strings
- Plays bass notes
- Can alternate between strings

**Finger Position:**
- i, m, and a play the G, B, and high E strings
- Assign each finger to a string
- Keep fingers relaxed and curved

**Basic Exercise:**
\`\`\`
p - i - m - a (on open strings)
Thumb plucks Low E, then each finger plays its string
\`\`\`

**Right Hand Position:**
- Rest your wrist lightly on the guitar
- Hand should float above the strings
- Fingers curved, ready to pluck
- Thumb in front of fingers

**Practice Exercise:**
Alternate thumb between Low E and A strings while fingers play open strings:
\`\`\`
E: p   p   p   p
B:   i   i   i   i
G:     m   m   m   m
\`\`\`

Start slowly and build coordination!`,
    xpReward: 30,
    duration: '12 min'
  },
  {
    id: 'c5-l2',
    number: 2,
    title: 'Travis Picking Pattern',
    type: 'text',
    content: `Travis picking is a fingerstyle technique where the thumb alternates bass notes while fingers play melody.

**The Basic Pattern (C Chord):**
\`\`\`
Thumb: C (A string) - G (Low E) - C - G
Fingers: Play B or G string on off-beats
\`\`\`

**Step-by-Step:**
1. Form a C chord
2. Thumb plays the A string (C note)
3. Middle finger plays the G string
4. Thumb plays the Low E string
5. Index finger plays the B string

**Pattern Notation:**
\`\`\`
p - m - p - i
(C) (G) (G) (B)
\`\`\`

**Common Travis Patterns:**
\`\`\`
Pattern 1: p i p m p i p m
Pattern 2: p m p i p m p i
Pattern 3: p i p m p a p m
\`\`\`

**Famous Songs Using Travis Picking:**
- "Dust in the Wind" by Kansas
- "The Boxer" by Simon & Garfunkel
- "Dear Prudence" by The Beatles
- "Blackbird" by The Beatles

**Practice Tips:**
1. Master the thumb pattern first (like a metronome)
2. Add one finger at a time
3. Keep the thumb steady and consistent
4. Practice slowly with a metronome

**Practice Exercise:**
Hold a G chord and play:
\`\`\`
p (Low E) - i (B) - p (D) - m (G)
Repeat continuously
\`\`\`

The thumb is your bass player - keep it steady!`,
    xpReward: 50,
    duration: '20 min'
  },
  {
    id: 'c5-l3',
    number: 3,
    title: 'The CAGED System',
    type: 'text',
    content: `The CAGED system shows how five open chord shapes (C, A, G, E, D) create the entire fretboard.

**The Five Shapes:**
Each letter of C-A-G-E-D represents a movable chord shape:
- **C Shape**: Based on the C Major open chord
- **A Shape**: Based on the A Major open chord
- **G Shape**: Based on the G Major open chord
- **E Shape**: Based on the E Major open chord (barre chords!)
- **D Shape**: Based on the D Major open chord

**How It Works:**
Each shape connects to the next up the neck. Slide any shape up, and you get a new chord!

**Example - C Major Everywhere:**
- Open position: C shape
- 3rd fret: A shape barre
- 5th fret: G shape
- 8th fret: E shape barre
- 10th fret: D shape

**Why Learn CAGED?**
- Find chords anywhere on the neck
- Connect scales to chord shapes
- Understand the fretboard
- Create interesting voicings
- Solo using chord tones

**The Connection:**
\`\`\`
C (open) → A (3rd fret) → G (5th fret) → E (8th fret) → D (10th fret) → C (12th fret)
\`\`\`

**Practice Exercise:**
Play C Major using all five shapes up the neck. Name the root note on each shape!

This system unlocks the entire fretboard - no more getting stuck in open positions!`,
    xpReward: 60,
    duration: '25 min'
  },
  {
    id: 'c5-l4',
    number: 4,
    title: 'Suspended Chords',
    type: 'chord',
    chordName: 'Dsus4',
    content: `Suspended (sus) chords create tension and movement. They're used in countless songs for that "lift" feeling.

**What Are Suspended Chords?**
They "suspend" the 3rd of the chord, replacing it with either a 2nd (sus2) or 4th (sus4).

**D Suspended 4 (Dsus4):**
1. Place your 1st finger on the 2nd fret of the G string
2. Place your 3rd finger on the 3rd fret of the B string
3. Place your 2nd finger on the 3rd fret of the high E string (pinky works too)
4. Play the top 4 strings only

**The Classic Progression:**
\`\`\`
D → Dsus4 → D → Dsus2 → D
\`\`\`

This creates that iconic "pinch and release" sound heard in thousands of songs!

**Other Common Sus Chords:**
- Asus4: Like A major, but pinky on 3rd fret of B string
- Asus2: Like A major, but remove middle finger
- Esus4: Like E major, but pinky on 2nd fret of G string

**In Songs:**
- "Pinball Wizard" by The Who
- "Patience" by Guns N' Roses
- "Wonderwall" intro
- "Free Fallin'" by Tom Petty

**Practice Exercise:**
Play this progression:
\`\`\`
D - Dsus4 - D - Asus4 - G
\`\`\`

Notice how the suspended chords create tension that resolves when you return to the major chord!`,
    xpReward: 40,
    duration: '15 min'
  },
  {
    id: 'c5-l5',
    number: 5,
    title: 'Add9 and Major 7th Chords',
    type: 'text',
    content: `Add9 and Maj7 chords add color and sophistication to your playing.

**C Add9 (Cadd9):**
A beautiful, sparkly chord often used instead of regular C Major.

**Fingering:**
1. Place your 2nd finger on the 3rd fret of the A string
2. Place your 3rd finger on the 2nd fret of the D string
3. Leave G string open
4. Place your 1st finger on the 3rd fret of the B string? No!
5. Instead: Place your 4th finger on the 3rd fret of the high E string

**Easier Cadd9:**
\`\`\`
Cadd9: x32030
Just add your pinky to the 3rd fret of the high E string on a regular C!
\`\`\`

**G Major 7 (GMaj7):**
1. Form a regular G chord
2. Lift your 1st finger (remove the 2nd fret on the A string)
3. Let the A string ring open

**The Sound:**
- Add9: Open, dreamy, modern
- Maj7: Jazzy, sophisticated, relaxed

**Famous Uses:**
- "Every Breath You Take" (add9 chords)
- "Under the Bridge" by RHCP (add9)
- "Hotel California" (maj7 chords)
- Many Steely Dan and jazz songs

**Practice Progression:**
\`\`\`
Cadd9 - G - Em7 - D/F#
\`\`\`

This is the "sensitive singer-songwriter" progression!`,
    xpReward: 50,
    duration: '18 min'
  },
  {
    id: 'c5-l6',
    number: 6,
    title: 'Arpeggios',
    type: 'text',
    content: `Arpeggios are chords played one note at a time. They're essential for melodies and solos.

**What is an Arpeggio?**
Instead of strumming all strings at once, you pick them individually in sequence.

**C Major Arpeggio (Open Position):**
\`\`\`
Low E: x (do not play)
A: 3 (C note) - Root
D: 2 (E note) - 3rd
G: 0 (G note) - 5th
B: 1 (C note) - Root (octave)
High E: 0 (E note) - 3rd (octave)
\`\`\`

**Practice Pattern:**
Play up: A → D → G → B → high E
Play down: high E → B → G → D → A

**Sweep Picking (Advanced):**
One smooth motion across the strings, articulating each note.

**Arpeggio Shapes:**
Every chord has an arpeggio shape. Learn:
- Major arpeggios (Root - 3rd - 5th)
- Minor arpeggios (Root - ♭3rd - 5th)
- Dominant 7th arpeggios

**In Solos:**
Arpeggios outline the chord changes perfectly. Try playing a C major arpeggio over a C chord!

**Famous Arpeggio Songs:**
- "Stairway to Heaven" intro
- "Nothing Else Matters" by Metallica
- "Fast Car" by Tracy Chapman

**Practice Exercise:**
Hold a G chord and play this pattern:
\`\`\`
Low E - D - G - B - high E - B - G - D
\`\`\`

This is the pattern from "Everybody Hurts" by R.E.M.!`,
    xpReward: 55,
    duration: '20 min'
  },
  {
    id: 'c5-l7',
    number: 7,
    title: 'Harmonics',
    type: 'text',
    content: `Harmonics create bell-like, chiming tones. They add texture and magic to your playing.

**Natural Harmonics:**
Lightly touch (do not press) the string directly over the fret, then pick and release.

**Where They Work:**
- 12th fret: One octave above open string
- 7th fret: One octave + fifth above
- 5th fret: Two octaves above open string
- 4th fret: Two octaves + major third

**Technique:**
1. Lightly touch the string directly over the metal fret (not between)
2. Pick the string
3. Immediately release your touching finger
4. A ringing harmonic should sustain

**Artificial Harmonics:**
Fret a note normally, then touch the harmonic node (12 frets above your fingered note).

**Pinch Harmonics (Squealies):**
1. Pick the note
2. Immediately touch the string with your thumb
3. Creates that screaming rock/metal sound

**In Music:**
- "Roundabout" by Yes (intro harmonics)
- "Killing in the Name" by RATM (pinch harmonics)
- Many Eddie Van Halen solos

**Practice Exercise:**
Play natural harmonics on all strings at the:
- 12th fret
- 7th fret
- 5th fret

Listen to the different pitches and ring times!

Harmonics are like guitar magic - use them sparingly for maximum effect!`,
    xpReward: 45,
    duration: '15 min'
  },
  {
    id: 'c5-l8',
    number: 8,
    title: 'Tapping Technique',
    type: 'text',
    content: `Tapping allows you to play incredibly fast, fluid lines using both hands on the fretboard.

**Basic Tapping:**
1. Fret a note with your left hand
2. "Tap" a higher fret on the same string with a finger from your right hand
3. Pull off to sound the lower note
4. Can add more taps for cascading effects

**The Van Halen Technique:**
Eddie Van Halen popularized two-handed tapping in "Eruption."

**Simple Exercise:**
\`\`\`
Left hand: 5th fret (G string)
Right hand tap: 12th fret
Pattern: Tap - Pull-off to 5th fret
\`\`\`

**Multi-Finger Tapping:**
Use multiple fingers on your right hand to tap different frets, creating arpeggios and scales.

**Equipment Tip:**
- High gain/distortion helps notes sustain
- Compressor can even out volume
- But tapping works on acoustic too!

**Building Speed:**
1. Start with single taps
2. Add pull-offs
3. Try tapping on different strings
4. Combine with legato techniques

**Famous Tapping Songs:**
- "Eruption" by Van Halen
- "One" by Metallica (solo)
- "Big Trouble" by David Lee Roth

**Practice Exercise:**
On the G string:
1. Left hand: 5th fret
2. Right hand: Tap 12th fret, pull off to 5th
3. Right hand: Tap 9th fret, pull off to 5th
4. Repeat

This creates a fast triplet effect!`,
    xpReward: 60,
    duration: '25 min'
  },
  {
    id: 'c5-l9',
    number: 9,
    title: 'Modes Explained Simply',
    type: 'text',
    content: `Modes are scales derived from the major scale. Each has its own unique mood and sound.

**The Seven Modes (from C Major):**
\`\`\`
C - D - E - F - G - A - B - C (C Major / Ionian)
D - E - F - G - A - B - C - D (D Dorian)
E - F - G - A - B - C - D - E (E Phrygian)
F - G - A - B - C - D - E - F (F Lydian)
G - A - B - C - D - E - F - G (G Mixolydian)
A - B - C - D - E - F - G - A (A Minor / Aeolian)
B - C - D - E - F - G - A - B (B Locrian)
\`\`\`

**The Most Useful Modes:**

**Dorian (Minor with a raised 6th):**
- Bright, jazzy minor sound
- Used in: "Oye Como Va", "So What"

**Mixolydian (Major with a lowered 7th):**
- Bluesy, rock sound
- Used in: "Sweet Child O' Mine", "Norwegian Wood"

**The Secret:**
All modes contain the same notes! The difference is which note you treat as the "home" note.

**Practical Application:**
- Over minor chords: Try Dorian
- Over dominant 7th chords: Try Mixolydian
- Over major chords: Try Lydian for a dreamy sound

**Don't Overthink It:**
Start with Dorian and Mixolydian. Master those before exploring others.

**Practice Exercise:**
Play A minor pentatonic over an Am chord (Aeolian sound)
Now emphasize the F# note (6th fret, B string) - that is A Dorian!

Modes are just different colors from the same palette!`,
    xpReward: 70,
    duration: '25 min'
  },
  {
    id: 'c5-l10',
    number: 10,
    title: 'Final Challenge: Classical Gas',
    type: 'song',
    songId: 'classical-gas',
    content: `You've reached the end of Chapter 5 and completed the Beginner to Advanced course! For your final challenge, learn "Classical Gas" by Mason Williams.

**Why This Song?**
It combines everything you've learned:
- Fingerstyle technique
- Chord changes
- Melody and bass lines
- Speed and precision
- Musical expression

**The Approach:**
1. Learn the introduction slowly (first 8 bars)
2. Break it into small sections
3. Practice hands separately
4. Gradually increase speed
5. Focus on clean articulation

**Techniques Used:**
- Travis picking style
- Arpeggios
- Quick chord changes
- Thumb control for bass notes
- Accurate finger placement

**Alternative Final Piece Options:**
- "Blackbird" by The Beatles (fingerstyle)
- "Dust in the Wind" by Kansas (Travis picking)
- "Tears in Heaven" by Eric Clapton (fingerstyle)
- "Fast Car" by Tracy Chapman (fingerpicking)

**Your Journey:**
✓ Chapter 1: Open chords and basics
✓ Chapter 2: Minor chords and strumming
✓ Chapter 3: Barre chords and power chords
✓ Chapter 4: Blues and lead guitar
✓ Chapter 5: Advanced techniques and theory

**What You Can Do Now:**
- Play thousands of songs
- Understand music theory
- Create your own music
- Improvise solos
- Play with others

**The Journey Continues:**
There is always more to learn! Consider:
- Jazz chords and standards
- Classical guitar repertoire
- Advanced soloing techniques
- Songwriting
- Recording and production

You've built a solid foundation. Keep playing, keep learning, and most importantly - enjoy the music! 🎸🎵

Congratulations, guitarist!`,
    xpReward: 200,
    duration: '45 min'
  }
]
  }

export default chapter005;
