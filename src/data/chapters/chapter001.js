const chapter001 = {
  id: 'chapter-1',
  number: 1,
  title: 'Getting Started',
  subtitle: 'Your First Chords',
  description: 'Learn the basics of guitar playing, including proper finger placement, strumming technique, and your first open chords.',
  color: '#22c55e',
  requiredLevel: 1,
  lessons: [
{
 id: 'c1-l1',
    number: 1,
    title: 'Welcome to Guitar',
    type: 'text',
    goalTags: ['learn_chords', 'strumming'],
    content: `Welcome to your guitar journey! The guitar is one of the most versatile and popular instruments in the world. In this course, you'll learn step-by-step how to play.

        **Parts of the Guitar:**
        - **Body**: The large hollow part that amplifies the sound
        - **Neck**: The long piece with metal frets where you press the strings
        - **Headstock**: The top part where tuning pegs are located
        - **Strings**: 6 strings numbered from bottom (1st - high E) to top (6th - low E)

        **Holding the Guitar:**
        - Sit up straight with the guitar resting on your right leg (for right-handed players)
        - The neck should be angled slightly upward
        - Keep your back straight and shoulders relaxed

        **Proper Hand Position:**
        - Left hand: Thumb behind the neck, fingers curved over the fretboard
        - Right hand: Rest on the strings near the soundhole
        - Keep wrists relaxed and avoid bending them too much`,
    xpReward: 10,
    duration: '5 min'
    },
{
 id: 'c1-l2',
    number: 2,
    title: 'Reading Chord Diagrams',
    type: 'text',
    goalTags: ['learn_chords'],
    content: `Chord diagrams are visual representations of where to place your fingers on the fretboard.

        **Understanding the Diagram:**
        - Vertical lines represent strings (left to right: Low E to High E)
        - Horizontal lines represent frets
        - Numbers indicate which finger to use (1=index, 2=middle, 3=ring, 4=pinky)
        - 'O' means play the string open
        - 'X' means do not play that string

        **Example - E Major:**
        \`\`\`
        e |---0---|  (open high E)
        B |---0---|  (open B string)
        G |---1---|  (1st finger, 1st fret)
        D |---2---|  (2nd finger, 2nd fret)
        A |---2---|  (3rd finger, 2nd fret)
        E |---0---|  (open low E)
        \`\`\`

        **Practice Tip:** Always check that each string rings clearly when you strum!`,
    xpReward: 10,
    duration: '5 min'
    },
{
 id: 'c1-l3',
    number: 3,
    title: 'The E Major Chord',
    type: 'chord',
    chordName: 'E',
    goalTags: ['learn_chords'],
    content: `The E Major chord is one of the most fundamental chords in guitar playing. It uses all six strings and has a rich, full sound.

        **Finger Placement:**
        1. Place your 1st (index) finger on the 1st fret of the G string (3rd string)
        2. Place your 2nd (middle) finger on the 2nd fret of the A string (5th string)
        3. Place your 3rd (ring) finger on the 2nd fret of the D string (4th string)
        4. Leave the Low E, B, and High E strings open

        **Common Mistakes to Avoid:**
        - Muting adjacent strings with your fingertips
        - Not pressing hard enough against the frets
        - Placing fingers too far from the frets (stay close to the metal fret)

        **Practice Exercise:**
        Strum down slowly, checking each string individually. All six strings should ring clearly.`,
    xpReward: 25,
    duration: '10 min'
    },
{
 id: 'c1-l4',
    number: 4,
    title: 'The A Major Chord',
    type: 'chord',
    chordName: 'A',
    goalTags: ['learn_chords'],
    content: `The A Major chord introduces you to cramming multiple fingers into a small space on the same fret.

        **Finger Placement:**
        There are multiple ways to play A Major. Here's the most common:
        1. Place your 1st finger on the 2nd fret of the D string (4th string)
        2. Place your 2nd finger on the 2nd fret of the G string (3rd string)
        3. Place your 3rd finger on the 2nd fret of the B string (2nd string)
        4. Do NOT play the Low E string (mute it or avoid it)
        5. The High E string is played open

        **Alternative Fingerings:**
        - Some players use one finger to barre all three strings
        - Others use fingers 2, 3, and 4 to leave the index finger free

        **Practice Exercise:**
        Alternate between E Major and A Major. This is your first chord change!`,
    xpReward: 25,
    duration: '10 min'
    },
{
 id: 'c1-l5',
    number: 5,
    title: 'Basic Strumming Pattern',
    type: 'text',
    goalTags: ['strumming'],
    content: `Now that you know two chords, let's learn to strum! Strumming is what gives the guitar its rhythm and feel.

        **The Basic Down-Strum:**
        1. Hold your pick between your thumb and index finger (or use your thumb)
        2. Strum downward across all strings in one smooth motion
        3. Keep your wrist relaxed and loose
        4. Aim to hit the strings with a consistent motion

        **The Four-Beat Pattern:**
        \`\`\`
        1 - 2 - 3 - 4 -
        D   D   D   D
        \`\`\`
        (D = Down strum)

        **Timing Tips:**
        - Count out loud: "1, 2, 3, 4"
        - Make each strum equal in length
        - Start slow, then gradually speed up
        - Use a metronome to keep steady time

        **Practice Exercise:**
        Play E Major and strum four beats, then switch to A Major and strum four beats. Repeat!`,
    xpReward: 20,
    duration: '10 min'
    },
{
 id: 'c1-l6',
    number: 6,
    title: 'The D Major Chord',
    type: 'chord',
    chordName: 'D',
    goalTags: ['learn_chords'],
    content: `The D Major chord is bright and cheerful. It's one of the "Big Three" beginner chords along with E and A.

        **Finger Placement:**
        1. Place your 1st finger on the 2nd fret of the G string (3rd string)
        2. Place your 2nd finger on the 2nd fret of the high E string (1st string)
        3. Place your 3rd finger on the 3rd fret of the B string (2nd string)
        4. Play only the top 4 strings (D, G, B, high E)
        5. Do NOT play the Low E and A strings

        **The D Shape:**
        Notice how your fingers form a triangular "D" shape on the fretboard.

        **Common Issues:**
        - Accidentally muting the high E string with your 3rd finger
        - Playing the Low E string (it sounds muddy in this chord)

        **Practice Exercise:**
        Practice the progression: D - A - E - D. This is used in countless songs!`,
    xpReward: 25,
    duration: '10 min'
    },
{
 id: 'c1-l7',
    number: 7,
    title: 'Your First Song: Three Little Birds',
    type: 'song',
    songId: 'three-little-birds',
    goalTags: ['songs', 'learn_chords'],
    content: `It's time to play your first song! "Three Little Birds" by Bob Marley uses just three chords: A, D, and E.

        **The Chord Progression:**
        \`\`\`
        A      D      A      A
        "Don't worry, about a thing..."

        D      A      E      A
        "Cause every little thing, gonna be alright..."
        \`\`\`

        **Strumming Pattern:**
        Try this simple pattern:
        \`\`\`
        D   D   D   D
        1   2   3   4
        \`\`\`

        **Tips for Success:**
        1. Practice chord changes slowly first
        2. Don't worry about singing yet - focus on playing
        3. If a chord buzzes, reset your fingers and try again
        4. Keep a steady rhythm - it is better to play slowly and cleanly than fast and messy

        You've got this! Playing your first song is a huge milestone!`,
    xpReward: 50,
    duration: '15 min'
    },
{
 id: 'c1-l8',
    number: 8,
    title: 'The G Major Chord',
    type: 'chord',
    chordName: 'G',
    goalTags: ['learn_chords'],
    content: `The G Major chord is essential and appears in thousands of songs. There are two common ways to play it.

        **Method 1 - Three-Finger G:**
        1. Place your 2nd finger on the 3rd fret of the Low E string
        2. Place your 1st finger on the 2nd fret of the A string
        3. Place your 3rd finger on the 3rd fret of the high E string
        4. Play all six strings

        **Method 2 - Four-Finger G (Full):**
            Add your 4th (pinky) finger on the 3rd fret of the B string for an even fuller sound.

            **Practice Tips:**
                - The stretch between fingers 1 and 2 can be challenging at first
                - Keep your thumb positioned behind the neck for better reach
                - Practice switching between G and D, as these often appear together

                **Practice Exercise:**
                Play the progression: G - D - Em - C (these four chords are used in countless pop songs!)`,
            xpReward: 30,
            duration: '12 min'
    },
{
 id: 'c1-l9',
    number: 9,
    title: 'The C Major Chord',
    type: 'chord',
    chordName: 'C',
    goalTags: ['learn_chords'],
    content: `The C Major chord completes your collection of the five essential open chords. It's often considered the most challenging for beginners.

        **Finger Placement:**
        1. Place your 1st finger on the 1st fret of the B string (2nd string)
        2. Place your 2nd finger on the 2nd fret of the D string (4th string)
        3. Place your 3rd finger on the 3rd fret of the A string (5th string)
        4. Play only the top 5 strings (A through high E)
        5. Do NOT play the Low E string

        **The Challenge:**
        Your 3rd finger needs to arch over to reach the A string without touching the high E string below it.

        **Practice Strategy:**
        1. Place your fingers one at a time, checking each string
        2. Start with just the C chord, strumming and adjusting
        3. Once comfortable, practice C to G changes

        **Practice Exercise:**
        Play C - G - Am - F (the famous "Axis of Awesome" four-chord progression).`,
    xpReward: 35,
    duration: '15 min'
    },
{
 id: 'c1-l10',
    number: 10,
    title: 'Chapter 1 Review Song',
    type: 'song',
    songId: 'knocking-on-heavens-door',
    goalTags: ['songs', 'learn_chords', 'strumming'],
    content: `Congratulations on reaching the end of Chapter 1! You've learned the five essential open chords: E, A, D, G, and C.

        **"Knockin' on Heaven's Door" by Bob Dylan**

        This iconic song uses just three chords: G, D, and Am (we'll learn Am in the next chapter, but for now, use C instead).

        **Chords:**
        \`\`\`
        G              D              C
        "Mama, take this badge off of me..."

        G              D              C
        "I cannot use it anymore..."
        \`\`\`

        **Strumming:**
        Use a simple down-strum pattern. Focus on clean chord changes and steady rhythm.

        **What You've Learned:**
        ✓ How to hold the guitar properly
        ✓ How to read chord diagrams
        ✓ Five essential open chords
        ✓ Basic strumming technique
        ✓ Your first songs!

        **Next Chapter Preview:**
        In Chapter 2, you'll learn minor chords, more strumming patterns, and barre chord foundations.

        Take a moment to celebrate your progress. You're now a guitar player! 🎸`,
    xpReward: 75,
    duration: '20 min'
    }
    ]
};

export default chapter001;
