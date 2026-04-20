const chapter006 = {
  id: 'chapter-6',
  number: 6,
  title: 'Jazz & Extended Chords',
  subtitle: 'Color Tones & Voicings',
  description: 'Expand your harmonic vocabulary with 7th, 9th, 11th, and 13th chords. Enter the rich world of jazz guitar.',
  color: '#06b6d4',
  requiredLevel: 6,
  lessons: [
  {
    id: 'c6-l1',
    number: 1,
    title: 'The Language of Jazz Chords',
    type: 'text',
    content: `Jazz guitar uses extended chords to create rich, sophisticated harmony. These chords add color and tension beyond basic triads.

**Chord Extensions:**
- **7th**: Adds a note a 7th above the root (b7 for dominant, maj7 for major)
- **9th**: Adds the 9th (same as 2nd, one octave up)
- **11th**: Adds the 11th (same as 4th, one octave up)
- **13th**: Adds the 13th (same as 6th, one octave up)

**Why Extensions Matter:**
- Create smoother voice leading between chords
- Add tension and resolution
- Sound more professional and polished
- Essential for jazz, R&B, neo-soul, and fusion

**The Dominant 7th as Gateway:**
Most extended chords build on dominant 7th harmony. Mastering dominant 7ths opens the door to 9ths, 11ths, and 13ths.

**Practice Philosophy:**
Jazz chords can seem overwhelming at first. Focus on one chord quality at a time. Quality over quantity!`,
    xpReward: 30,
    duration: '10 min'
  },
  {
    id: 'c6-l2',
    number: 2,
    title: 'Major 7th Chords',
    type: 'chord',
    chordName: 'Cmaj7',
    content: `Major 7th chords sound dreamy, open, and sophisticated. They're used everywhere from jazz to pop.

**C Major 7 (Cmaj7):**
1. Place your 3rd finger on the 3rd fret of the A string
2. Place your 2nd finger on the 2nd fret of the D string
3. Play the G string open
4. Place your 1st finger on the 1st fret of the B string
5. Play the high E string open
6. Do NOT play the Low E string

**Alternative Voicing (Root on Low E):**
- Barre the 8th fret with your 1st finger (E-shape barre)
- This gives a fuller, bass-heavy sound

**The Sound:**
Major 7ths have a floating, unresolved beauty. Think of the opening chord in "Under the Bridge" or countless Steely Dan songs.

**Common Progression:**
Cmaj7 → Am7 → Dm7 → G7 (the "jazz turnaround")

**Practice Exercise:**
Practice transitioning between Cmaj7 and C major. Notice how the 7th (B note) adds sweetness and color.`,
    xpReward: 45,
    duration: '15 min'
  },
  {
    id: 'c6-l3',
    number: 3,
    title: 'Dominant 9th Chords',
    type: 'chord',
    chordName: 'E9',
    content: `Dominant 9th chords are the bread and butter of funk, jazz, and blues. They add the 9th extension for extra flavor.

**E9 (Funky Shape):**
1. Place your 1st finger on the 2nd fret of the A string (barre the D and G strings too)
2. Place your 2nd finger on the 2nd fret of the D string
3. Place your 3rd finger on the 2nd fret of the G string
4. Play the B string open
5. Place your 4th finger on the 2nd fret of the high E string
6. Do NOT play the Low E string

**The Hendrix Shape:**
Jimi Hendrix popularized a thumb-over voicing that combines bass notes with chord extensions. This is essential for soul and R&B.

**The Funk Sound:**
E9 is heard in countless funk songs. Play it with short, percussive strums and mutes.

**Practice Exercise:**
Try this funky progression:
E9 → A9 → B9 → A9

Use all down-strums with heavy palm muting. This is the foundation of funk guitar!`,
    xpReward: 50,
    duration: '18 min'
  },
  {
    id: 'c6-l4',
    number: 4,
    title: 'Minor 7th Flat 5 (m7b5)',
    type: 'chord',
    chordName: 'Bm7b5',
    content: `The half-diminished chord (m7b5) is mysterious, tense, and beautiful. It's the ii chord in minor keys and creates sophisticated harmony.

**Bm7b5 (Common Shape):**
1. Place your 1st finger on the 1st fret of the A string
2. Place your 2nd finger on the 2nd fret of the D string
3. Place your 3rd finger on the 2nd fret of the G string
4. Place your 4th finger on the 2nd fret of the high E string
5. Do NOT play the Low E and B strings

**Where It Lives:**
- ii chord in minor key progressions
- vii chord in major keys
- Creates tension that resolves beautifully to dominant chords

**The Sound:**
Dark, sophisticated, slightly unsettled. Used in jazz ballads, bossa nova, and film music.

**Classic Progression:**
Bm7b5 → E7 → Am (ii-V-i in A minor)

**Practice Exercise:**
Play this minor jazz progression:
Am7 → Dm7 → Bm7b5 → E7 → Am7

Listen to how the m7b5 creates forward momentum!`,
    xpReward: 55,
    duration: '20 min'
  },
  {
    id: 'c6-l5',
    number: 5,
    title: 'Chord Voicings & Voice Leading',
    type: 'text',
    content: `Voice leading is the art of moving smoothly between chords. In jazz, this means minimal finger movement and shared notes between chords.

**The Concept:**
Instead of jumping around the fretboard, move each "voice" (string) as little as possible.

**Example - ii-V-I in C Major:**
\`\`\`
Dm7:  x57565
G7:   x55556  (only one note changes!)
Cmaj7: x35453 (smooth voice leading from G7)
\`\`\`

**Shell Voicings:**
Play only the root, 3rd, and 7th of a chord. This leaves space for other instruments and creates a clean jazz sound.

**Drop 2 Voicings:**
Take a close-position chord and "drop" the second-highest note down an octave. This creates spread voicings that sound full on guitar.

**Practice Strategy:**
1. Learn one ii-V-I voicing set on the middle 4 strings
2. Practice moving between them smoothly
3. Add extensions (9ths, 13ths) once comfortable

**Practice Exercise:**
Play ii-V-I in these keys: C, F, G, Bb
Use shell voicings and focus on smooth transitions.`,
    xpReward: 60,
    duration: '22 min'
  },
  {
    id: 'c6-l6',
    number: 6,
    title: 'The ii-V-I Progression',
    type: 'text',
    content: `The ii-V-I is the most important chord progression in jazz. Mastering it unlocks thousands of jazz standards.

**What is ii-V-I?**
- **ii**: Minor 7th chord built on the 2nd scale degree
- **V**: Dominant 7th chord built on the 5th scale degree
- **I**: Major 7th chord built on the 1st scale degree

**In C Major:**
Dm7 → G7 → Cmaj7

**In F Major:**
Gm7 → C7 → Fmaj7

**Why It Works:**
The progression creates tension (ii), increases tension (V), and resolves (I). It's harmonic storytelling in three chords.

**Jazz Standards Using ii-V-I:**
- "Autumn Leaves"
- "Fly Me to the Moon"
- "Blue Bossa"
- "All the Things You Are"
- "Satin Doll"

**Practice Exercise:**
Play ii-V-I in all 12 keys using root-position 7th chords. This is the jazz guitarist's daily warm-up!`,
    xpReward: 65,
    duration: '25 min'
  },
  {
    id: 'c6-l7',
    number: 7,
    title: 'Jazz Blues Progression',
    type: 'text',
    content: `The jazz blues takes the simple 12-bar blues and adds sophisticated chord substitutions.

**Basic Blues (in F):**
\`\`\`
F7 - F7 - F7 - F7
Bb7 - Bb7 - F7 - F7
C7 - Bb7 - F7 - C7
\`\`\`

**Jazz Blues (in F):**
\`\`\`
F7 - Bb7 - F7 - Cm7 F7
Bb7 - Bdim7 - F7 - D7 Gm7
C7 - Bb7 - F7 D7 - Gm7 C7
\`\`\`

**Added Chords:**
- **Quick IV**: Bb7 in bar 2
- **ii-V**: Cm7-F7 in bar 4
- **Diminished passing**: Bdim7 in bar 6
- **Turnaround**: Gm7-C7 in bars 11-12

**The Sound:**
Still bluesy, but with more harmonic movement and sophistication.

**Practice Exercise:**
Learn the jazz blues in F. Use dominant 9th voicings and practice with a steady swing feel.`,
    xpReward: 70,
    duration: '25 min'
  },
  {
    id: 'c6-l8',
    number: 8,
    title: 'Bossa Nova Rhythm',
    type: 'text',
    content: `Bossa Nova combines jazz harmony with Brazilian rhythms. The guitar pattern is distinctive and beautiful.

**The Basic Pattern:**
\`\`\`
1  &  2  &  3  &  4  &
bass  chord  chick  chord
\`\`\`

**Step-by-Step:**
1. Play the bass note (root or 5th) on beat 1
2. Strum a light chord on the "and" of 1
3. Mute/chick on beat 2
4. Strum chord on the "and" of 2
5. Repeat for beats 3 and 4

**The Feel:**
Bossa Nova has a relaxed, flowing groove. Don't rush! The rhythm should feel like waves on a beach.

**Common Bossa Nova Chords:**
- Major 6/9 chords
- Minor 9 chords
- Dominant 7th with altered extensions

**Classic Songs:**
- "The Girl from Ipanema"
- "Corcovado"
- "One Note Samba"
- "Wave"

**Practice Exercise:**
Play this progression with the Bossa Nova rhythm:
Am9 → D9 → Gmaj7 → Cmaj7 → F#m7b5 → B7 → Em7 → E7`,
    xpReward: 75,
    duration: '28 min'
  },
  {
    id: 'c6-l9',
    number: 9,
    title: 'Comping Patterns',
    type: 'text',
    content: `"Comping" (accompanying) is what jazz guitarists do behind a soloist. It's about rhythm, space, and interaction.

**Comping Rules:**
1. Leave space - don't play every beat
2. Listen to the soloist and react
3. Use short, percussive chord stabs
4. Vary your rhythms
5. Support, don't compete

**Freddie Green Style:**
The legendary Count Basie guitarist played sparse, quarter-note chords on every beat. Simple but effective!

**Modern Comping:**
Mix chord stabs with single-note lines and rhythmic hits.

**The Charleston Rhythm:**
\`\`\`
1   .   .   .   2   .   .   .   3   .   .   .   4   .   .   .
X                   X                                   X
\`\`\`
(A hit on beat 1 and the "and" of 2)

**Practice Exercise:**
Record yourself playing a ii-V-I loop. Then practice comping over it, focusing on space and rhythmic variety.`,
    xpReward: 80,
    duration: '25 min'
  },
  {
    id: 'c6-l10',
    number: 10,
    title: 'Chapter 6 Review: Autumn Leaves',
    type: 'song',
    songId: 'autumn-leaves',
    content: `"Autumn Leaves" is the perfect jazz standard for beginners. It uses mostly ii-V-I progressions in both major and minor.

**Chord Progression:**
\`\`\`
Am7 → D7 → Gmaj7 → Cmaj7
Fm7 → Bb7 → Ebmaj7
\`\`\`

**The Form:**
AABA - each section is 8 bars.

**Playing Tips:**
1. Use shell voicings for a clean sound
2. Keep the rhythm simple at first
3. Focus on smooth voice leading
4. Try adding chord extensions once comfortable

**Melody:**
The melody is beautiful and memorable. Try learning it by ear after mastering the chords.

**Chapter 6 Summary:**
✓ Major 7th, dominant 9th, and m7b5 chords
✓ Shell voicings and voice leading
✓ The ii-V-I progression
✓ Jazz blues form
✓ Bossa Nova rhythm
✓ Comping techniques

You've entered the world of jazz guitar - a lifetime of discovery awaits! 🎷🎸`,
    xpReward: 150,
    duration: '30 min'
  }
]
  }

export default chapter006;
