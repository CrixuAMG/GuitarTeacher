const chapter009 = {
  id: 'chapter-9',
  number: 9,
  title: 'Music Theory & Composition',
  subtitle: 'Write Your Own Music',
  description: 'Learn the theory behind great songs and develop your own compositional voice.',
  color: '#f59e0b',
  requiredLevel: 9,
  lessons: [
  {
    id: 'c9-l1',
    number: 1,
    title: 'Keys, Scales & Key Signatures',
    type: 'text',
    content: `Understanding keys is essential for writing music and communicating with other musicians.

**The Circle of Fifths:**
A visual tool showing the relationship between keys:
\`\`\`
C → G → D → A → E → B → F# → C#
C → F → Bb → Eb → Ab → Db → Gb → Cb
\`\`\`

**Key Signatures:**
Each key has a specific number of sharps or flats. Memorize them!

**Major Keys:**
- C: 0 sharps/flats
- G: 1 sharp (F#)
- D: 2 sharps (F#, C#)
- A: 3 sharps (F#, C#, G#)
- E: 4 sharps
- B: 5 sharps
- F#: 6 sharps

**Relative Minor:**
Every major key has a relative minor that shares the same key signature:
- C Major → A minor
- G Major → E minor
- D Major → B minor

**Practice Exercise:**
Draw the Circle of Fifths from memory. For each major key, name its relative minor and key signature.`,
    xpReward: 50,
    duration: '20 min'
  },
  {
    id: 'c9-l2',
    number: 2,
    title: 'Chord Functions & Progressions',
    type: 'text',
    content: `Chords have functions - they create tension or resolution. Understanding this helps you write better progressions.

**The Four Functions:**
- **Tonic (I)**: Home, rest, resolution
- **Subdominant (IV)**: Moving away from home, gentle tension
- **Dominant (V)**: Strong tension, wants to resolve home
- **Submediant (vi)**: Substitute for tonic, emotional color

**Common Progressions:**
\`\`\`
I - V - vi - IV ("Let It Be", "Someone Like You")
I - IV - V (Blues, Rock)
vi - IV - I - V ("Apologize", "Counting Stars")
i - VII - VI - V (Andalusian cadence)
\`\`\`

**Chord Substitution:**
Replace a chord with another that shares notes:
- I → iii or vi
- V → vii° or bVII

**Practice Exercise:**
Write a 4-chord progression in G major. Use only I, IV, V, and vi. Then substitute one chord with its relative.`,
    xpReward: 65,
    duration: '22 min'
  },
  {
    id: 'c9-l3',
    number: 3,
    title: 'Melody Writing',
    type: 'text',
    content: `A great melody is the heart of any song. Learn the principles of memorable melody writing.

**Melody Principles:**
1. **Contour**: Melodies should have shape - rise and fall
2. **Range**: Most vocal melodies stay within an octave
3. **Rhythm**: Syncopation and rests create interest
4. **Repetition**: Repeat motifs with variation
5. **Resolution**: End phrases on stable notes (root, 3rd, 5th)

**Motif & Development:**
Start with a short musical idea (2-4 notes). Then:
- Repeat it
- Invert it (upside down)
- Extend it
- Sequence it (move it up or down)

**The Hook:**
The most memorable part of your song. It should be:
- Simple
- Rhythmic
- Singable
- Repeated often

**Practice Exercise:**
Write a 4-note motif in E minor. Then develop it into an 8-bar melody using repetition, sequence, and variation.`,
    xpReward: 70,
    duration: '25 min'
  },
  {
    id: 'c9-l4',
    number: 4,
    title: 'Song Structure & Form',
    type: 'text',
    content: `Song structure determines how your musical ideas are organized. Different forms create different emotional journeys.

**Common Structures:**
\`\`\`
Verse-Chorus (ABAB):
Verse 1 → Chorus → Verse 2 → Chorus

Verse-Chorus-Bridge (ABABC):
Verse → Chorus → Verse → Chorus → Bridge → Chorus

AABA (32-bar jazz):
A section → A section → B section (bridge) → A section

Through-composed:
No repeating sections (rare in popular music)
\`\`\`

**The Role of Each Section:**
- **Verse**: Tells the story, builds anticipation
- **Chorus**: The payoff, the memorable part
- **Bridge**: Contrast, new perspective
- **Intro/Outro**: Sets up and wraps up

**Pre-Chorus:**
A section before the chorus that builds tension and makes the chorus hit harder.

**Practice Exercise:**
Analyze a favorite song's structure. Map out intro, verse, pre-chorus, chorus, bridge, and outro. Then write your own song using the same structure.`,
    xpReward: 60,
    duration: '20 min'
  },
  {
    id: 'c9-l5',
    number: 5,
    title: 'Modulation & Key Changes',
    type: 'text',
    content: `Modulation (changing keys) adds excitement, contrast, and emotional lift to your songs.

**Common Modulation Types:**
- **Up a whole step**: The "pop song lift" (e.g., "Love on Top")
- **To the relative minor/major**: Subtle color change
- **To the parallel key**: Major to minor (or vice versa) of the same root
- **Circle of fifths**: Smooth, jazz-like transitions

**The Truck Driver's Gear Change:**
Modulating up a semitone or whole step for the final chorus. It's effective but can be overused!

**Smooth Modulations:**
Use a pivot chord that exists in both keys to transition smoothly.

**Practice Exercise:**
Write a progression in C major, then modulate to D major for the chorus. Use G major as a pivot chord (it's in both keys).`,
    xpReward: 75,
    duration: '25 min'
  },
  {
    id: 'c9-l6',
    number: 6,
    title: 'Rhythm & Time Signatures',
    type: 'text',
    content: `Rhythm is half of music. Explore time signatures beyond 4/4 to create unique grooves.

**Common Time Signatures:**
- **4/4**: The standard ("common time")
- **3/4**: Waltz feel
- **6/8**: Compound feel (grouped in 3s)
- **5/4**: Odd meter ("Take Five")
- **7/8**: Prog rock favorite

**Polyrhythms:**
Two rhythms played simultaneously:
- 3 against 4
- 5 against 4

**Syncopation:**
Emphasizing off-beats creates rhythmic interest and groove.

**Metric Modulation:**
Smoothly transitioning from one tempo/time signature to another.

**Practice Exercise:**
Clap a steady 4/4 beat. Then clap a 3-beat pattern over it (polyrhythm). When comfortable, try playing it on guitar.`,
    xpReward: 70,
    duration: '22 min'
  },
  {
    id: 'c9-l7',
    number: 7,
    title: 'Arranging for Guitar',
    type: 'text',
    content: `Arranging means adapting music for your instrument. Learn to turn any song into a great guitar piece.

**Arrangement Strategies:**
1. **Chord-Melody**: Play chords and melody simultaneously
2. **Bass + Chords**: Thumb plays bass, fingers play chords
3. **Single Note + Chords**: Alternate between melody and accompaniment
4. **Double Stops**: Two notes at once for harmonic interest

**Chord-Melody Basics:**
- Find the melody note on top of each chord
- Use chord inversions to put the melody on the highest string
- Fill in harmony notes between melody and bass

**Drop 2 Voicings for Melody:**
These voicings keep the melody note on top while providing full harmony underneath.

**Practice Exercise:**
Take the melody of "Happy Birthday" and add simple chord shapes underneath. Put the melody note on the B or high E string.`,
    xpReward: 80,
    duration: '28 min'
  },
  {
    id: 'c9-l8',
    number: 8,
    title: 'Ear Training & Transcription',
    type: 'text',
    content: `Your ear is your most powerful musical tool. Developing it lets you learn any song by listening.

**Interval Recognition:**
Learn to identify the distance between two notes:
- Perfect 5th (power chord interval)
- Major 3rd (happy)
- Minor 3rd (sad)
- Major 7th (tense, wants to resolve)

**Chord Quality Recognition:**
Train your ear to hear the difference between:
- Major and minor
- Dominant 7th and major 7th
- Suspended chords

**Transcription Process:**
1. Listen to a short phrase repeatedly
2. Sing it until you know it by heart
3. Find the first note on your guitar
4. Figure out the rest note by note
5. Check your work by playing along

**Tools:**
- Slow down audio without changing pitch
- Loop difficult sections
- Use reference tones (tuning fork, app)

**Practice Exercise:**
Transcribe the melody of a simple song by ear. Start with nursery rhymes, then move to pop songs. No tabs allowed!`,
    xpReward: 85,
    duration: '30 min'
  },
  {
    id: 'c9-l9',
    number: 9,
    title: 'Lyrics & Songwriting',
    type: 'text',
    content: `Great songs combine great music with great lyrics. Learn to write words that resonate.

**Lyric Writing Tips:**
1. **Show, don't tell**: Use imagery and specifics
2. **Write what you know**: Authenticity connects
3. **Use rhyme schemes**: AABB, ABAB, ABCB
4. **Vary line length**: Creates rhythm and surprise
5. **The hook**: Repeat your central idea

**Common Themes:**
- Love (found, lost, complicated)
- Struggle and triumph
- Nostalgia and memory
- Social commentary
- Storytelling

**Collaboration:**
Many songwriters work in teams. One writes music, one writes lyrics. Find a collaborator!

**Writer's Block Solutions:**
- Change your environment
- Set a timer and write without editing
- Use writing prompts
- Collaborate with others

**Practice Exercise:**
Write lyrics to the melody you composed in the melody writing lesson. Focus on one vivid image or emotion.`,
    xpReward: 70,
    duration: '25 min'
  },
  {
    id: 'c9-l10',
    number: 10,
    title: 'Chapter 9 Review: Compose Your First Song',
    type: 'text',
    content: `You've learned the tools of composition. Now put them together and write your first complete song.

**Your Song Should Include:**
✓ A clear key and time signature
✓ Verse and chorus sections
✓ A chord progression that supports the melody
✓ A memorable hook or riff
✓ Lyrics (if you want a vocal song)
✓ Dynamics (loud/soft sections)

**The Process:**
1. Choose a key and basic progression
2. Write the chorus first (it's the heart)
3. Write verses that lead into the chorus
4. Add a bridge for contrast
5. Create an intro that sets the mood
6. Refine and edit

**Don't Aim for Perfection:**
Your first song won't be your best. That's normal! Every song you write makes you better.

**Share Your Music:**
Play it for a friend. Record it on your phone. Post it online. Music is meant to be shared!

**Chapter 9 Summary:**
✓ Keys and the circle of fifths
✓ Chord functions and progressions
✓ Melody writing principles
✓ Song structure and form
✓ Modulation techniques
✓ Arranging for guitar
✓ Ear training and transcription
✓ Lyric writing

You are now a songwriter! 🎵✍️`,
    xpReward: 250,
    duration: '45 min'
  }
]
  }

export default chapter009;
