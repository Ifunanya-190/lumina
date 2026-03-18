const Tutorial = require('./models/Tutorial');

async function seed() {
  const count = await Tutorial.countDocuments();
  if (count > 0) return;

  const tutorials = [
    // ===== CRAFTS =====
    {
      title: 'Origami Crane Mastery',
      description: 'Transform a simple square of paper into an elegant crane. This ancient Japanese art teaches patience, precision, and the beauty of transformation.',
      category: 'crafts',
      difficulty: 'beginner',
      duration: '15 min',
      thumbnail: '/images/origami.jpg',
      content: '# The Art of the Paper Crane\n\nThe origami crane is one of the most iconic paper folding designs in the world. In Japanese culture, it\'s believed that folding 1,000 cranes grants you a wish.\n\n## Materials Needed\n- One square sheet of paper (15cm x 15cm recommended)\n- A flat, clean surface\n- Patience and focus\n\n## History\nOrigami dates back to the 6th century when monks brought paper to Japan. The crane became a symbol of peace after Sadako Sasaki\'s story.\n\n## Tips for Success\n- Make your creases sharp and precise\n- Use thin, crisp paper for best results\n- Practice the basic folds before attempting the full crane\n- Don\'t rush \u2014 origami is meditation in motion',
      steps: [
        'Start with a square sheet of paper, colored side up',
        'Fold in half diagonally both ways, then unfold',
        'Fold in half horizontally and vertically, then unfold',
        'Collapse into a preliminary base (square base)',
        'Fold the top flaps to the center crease',
        'Fold the top triangle down as a crease guide',
        'Perform the petal fold on both sides',
        'Fold the legs up and reverse fold to create head and tail',
        'Gently pull the wings apart and shape your crane'
      ],
      tags: ['origami', 'paper', 'japanese', 'meditation', 'crafts']
    },
    {
      title: 'Leather Wallet Crafting',
      description: 'Learn to cut, stitch, and finish a professional-quality bifold leather wallet using hand tools and traditional techniques.',
      category: 'crafts',
      difficulty: 'intermediate',
      duration: '45 min',
      thumbnail: '/images/leather.jpg',
      content: '# Handmade Leather Wallet\n\nThere\'s something deeply satisfying about making something you carry every day. A hand-stitched leather wallet develops a beautiful patina over time.\n\n## Tools & Materials\n- Vegetable-tanned leather (2-3 oz weight)\n- Rotary cutter and cutting mat\n- Stitching chisels (diamond or pricking irons)\n- Waxed thread and harness needles\n- Edge beveler and burnisher\n- Contact cement\n\n## Leather Selection\nChoose vegetable-tanned leather for its ability to develop character. Chrome-tanned is softer but won\'t patina the same way.\n\n## Key Techniques\n- **Saddle stitching**: Two needles, one thread \u2014 stronger than machine stitching\n- **Edge finishing**: Bevel, sand, burnish for a professional look\n- **Creasing**: Adds decorative lines and guides for stitching',
      steps: [
        'Create a paper template \u2014 measure and cut pattern pieces',
        'Trace the pattern onto leather and cut with a rotary cutter',
        'Bevel all edges with an edge beveler tool',
        'Apply contact cement to joining surfaces and let dry until tacky',
        'Press pieces together firmly and let bond set',
        'Mark stitching holes using a stitching groover as guide',
        'Punch stitching holes with diamond chisels',
        'Saddle stitch all seams using waxed thread and two needles',
        'Burnish all exposed edges with water and a burnishing tool',
        'Apply leather conditioner and let cure overnight'
      ],
      tags: ['leather', 'wallet', 'sewing', 'handmade', 'crafts']
    },
    {
      title: 'Stained Glass Suncatcher',
      description: 'Master the copper foil method to create a stunning stained glass suncatcher with soldered joints and rich color.',
      category: 'crafts',
      difficulty: 'advanced',
      duration: '60 min',
      thumbnail: '/images/stainedglass.jpg',
      content: '# Creating Stained Glass Art\n\nStained glass combines art and engineering. The copper foil technique, popularized by Tiffany, allows intricate designs impossible with traditional lead came.\n\n## Tools & Materials\n- Glass sheets in your chosen colors\n- Glass cutter and running pliers\n- Copper foil tape (various widths)\n- Soldering iron (80-100 watts)\n- 60/40 solder\n- Flux and flux brush\n- Grinder with diamond bit\n- Safety glasses and gloves\n\n## Safety First\nAlways wear safety glasses when cutting glass. Work in a ventilated area when soldering. Wash hands after handling flux and solder.\n\n## Design Principles\n- Start simple \u2014 geometric designs are easier\n- Consider how light will pass through each color\n- Avoid very narrow or very acute angles in pieces',
      steps: [
        'Draw your suncatcher pattern at full size \u2014 number each piece',
        'Make two copies: one as a guide, cut the other into templates',
        'Score and break glass pieces following each template',
        'Grind all edges smooth on a glass grinder',
        'Clean each piece thoroughly \u2014 no dust or oil',
        'Wrap each piece in copper foil tape, centering the glass on the foil',
        'Burnish the foil firmly to the glass on all sides',
        'Arrange pieces on your pattern and tack-solder at joints',
        'Apply flux and run smooth solder beads along all copper foil seams',
        'Solder both sides, clean with soap and water, attach hanging loop'
      ],
      tags: ['stained glass', 'solder', 'tiffany', 'artistic', 'crafts']
    },
    // ===== COOKING =====
    {
      title: '5-Minute Chocolate Mug Cake',
      description: 'Satisfy your chocolate cravings in under 5 minutes with this microwave mug cake that tastes like it came from a bakery.',
      category: 'cooking',
      difficulty: 'beginner',
      duration: '5 min',
      thumbnail: '/images/cake.jpg',
      content: '# Instant Chocolate Bliss\n\nWho says you need an oven and an hour to bake a perfect cake? This mug cake proves that extraordinary things come in small packages.\n\n## Ingredients\n- 4 tbsp all-purpose flour\n- 4 tbsp sugar\n- 2 tbsp cocoa powder\n- 1 egg\n- 3 tbsp milk\n- 3 tbsp vegetable oil\n- A splash of vanilla extract\n- 2 tbsp chocolate chips\n\n## The Science\nThe microwave heats water molecules in the batter, creating steam that makes the cake rise. The egg provides structure while the oil keeps it moist.\n\n## Pro Tips\n- Don\'t overmix \u2014 lumps are okay!\n- Microwave times vary, start with 90 seconds\n- Add a scoop of ice cream on top for the ultimate treat\n- Use a large mug to prevent overflow',
      steps: [
        'Mix flour, sugar, and cocoa powder in a large microwave-safe mug',
        'Add the egg and mix thoroughly with a fork',
        'Pour in milk, vegetable oil, and vanilla extract',
        'Stir until the batter is smooth',
        'Drop in chocolate chips and gently fold them in',
        'Microwave on high for 90 seconds to 2 minutes',
        'Let it cool for 1 minute before eating \u2014 it\'s hot!'
      ],
      tags: ['chocolate', 'quick', 'microwave', 'dessert', 'easy']
    },
    {
      title: 'Homemade Pasta from Scratch',
      description: 'Learn to make fresh egg pasta dough, roll it by hand, and cut perfect fettuccine that beats any store-bought pasta.',
      category: 'cooking',
      difficulty: 'intermediate',
      duration: '40 min',
      thumbnail: '/images/pasta.jpg',
      content: '# Fresh Pasta Mastery\n\nOnce you taste fresh pasta, you\'ll never look at dried the same way. The silky texture and rich egg flavor are in a completely different league.\n\n## Ingredients\n- 2 cups (250g) "00" flour or all-purpose flour\n- 3 large eggs\n- 1 tbsp olive oil\n- Pinch of salt\n- Semolina flour for dusting\n\n## The Dough\nThe ratio is simple: 100g flour per egg. The key is kneading until the dough is smooth and elastic \u2014 at least 10 minutes.\n\n## Rolling Tips\n- Let dough rest 30 minutes before rolling\n- Use a pasta machine if available, or a long rolling pin\n- Roll thin enough to see your hand through it',
      steps: [
        'Mound flour on a clean surface and make a well in the center',
        'Crack eggs into the well, add oil and salt',
        'Use a fork to gradually incorporate flour into the eggs',
        'Once a shaggy dough forms, knead by hand for 10 minutes',
        'Wrap in plastic and rest for 30 minutes at room temperature',
        'Divide dough into 4 pieces, keep unused portions covered',
        'Roll each piece thin \u2014 pass through pasta machine or use a rolling pin',
        'Dust lightly with semolina, fold loosely, and cut into fettuccine strips',
        'Toss cut pasta with semolina to prevent sticking',
        'Cook in salted boiling water for 2-3 minutes until al dente'
      ],
      tags: ['pasta', 'italian', 'dough', 'handmade', 'cooking']
    },
    {
      title: 'Sushi Rolling Techniques',
      description: 'Master maki, uramaki, and temaki sushi rolls with proper rice preparation, fish handling, and knife skills.',
      category: 'cooking',
      difficulty: 'advanced',
      duration: '50 min',
      thumbnail: '/images/sushi.jpg',
      content: '# The Art of Sushi\n\nSushi is as much about technique and respect for ingredients as it is about taste. Mastering these rolls is a journey.\n\n## Equipment\n- Bamboo rolling mat (makisu)\n- Sharp sushi knife or chef\'s knife\n- Rice cooker or heavy-bottomed pot\n- Plastic wrap\n\n## Rice \u2014 The Foundation\nSushi rice is the most important element. It must be short-grain Japanese rice, seasoned with rice vinegar, sugar, and salt. The rice should be slightly warm, glossy and sticky.\n\n## Fish Safety\n- Always buy "sushi-grade" fish from reputable suppliers\n- Keep fish refrigerated until ready to use\n- Use fish the same day you buy it\n\n## Key Principles\n- Wet your hands before handling rice\n- Don\'t overfill rolls\n- Use a sharp, wet knife for clean cuts',
      steps: [
        'Cook sushi rice and season with vinegar mixture while hot; let cool to body temp',
        'Prepare fillings: slice fish, cut cucumber/avocado into thin strips',
        'Place nori shiny-side down on bamboo mat for maki roll',
        'Spread a thin, even layer of rice on nori leaving 1cm at the top',
        'Lay fillings in a line across the center of the rice',
        'Roll tightly using the bamboo mat, seal the edge with water',
        'For uramaki (inside-out): flip rice-covered nori, add fillings, roll with plastic wrap',
        'Wet your knife and cut each roll into 6-8 even pieces',
        'For temaki (hand roll): hold nori cone-style, fill with rice and toppings',
        'Plate with pickled ginger, wasabi, and soy sauce'
      ],
      tags: ['sushi', 'japanese', 'fish', 'rice', 'knife skills']
    },
    // ===== FITNESS =====
    {
      title: 'Morning Yoga Flow',
      description: 'Wake up your body and mind with this energizing 10-minute yoga sequence designed for all levels.',
      category: 'fitness',
      difficulty: 'beginner',
      duration: '10 min',
      thumbnail: '/images/yoga.jpg',
      content: '# Rise & Flow\n\nStart your day with intention and movement. This morning yoga flow is designed to gently wake up every muscle in your body.\n\n## Benefits\n- Increases flexibility and range of motion\n- Boosts energy better than coffee\n- Reduces morning stiffness\n- Sets a positive tone for the day\n\n## What You Need\n- A yoga mat or soft surface\n- Comfortable clothing\n- An open mind\n\n## Breathing\nFocus on deep, steady breaths. Inhale through your nose for 4 counts, exhale for 6 counts. Let your breath guide your movement.',
      steps: [
        'Begin in Child\'s Pose \u2014 breathe deeply for 5 breaths',
        'Flow to Tabletop, then Cat-Cow stretches for 8 rounds',
        'Push back to Downward Facing Dog, pedal your feet',
        'Walk hands to feet for Standing Forward Fold',
        'Rise slowly to Mountain Pose with arms overhead',
        'Flow through 3 Sun Salutation A sequences',
        'Hold Warrior I on each side for 5 breaths',
        'Transition to Warrior II, then Triangle Pose',
        'Return to standing, close with 3 deep breaths'
      ],
      tags: ['yoga', 'morning', 'flexibility', 'wellness', 'energy']
    },
    {
      title: 'HIIT Cardio Circuit',
      description: 'A 20-minute high-intensity interval training circuit that torches calories and builds endurance with no equipment needed.',
      category: 'fitness',
      difficulty: 'intermediate',
      duration: '20 min',
      thumbnail: '/images/hiit.jpg',
      content: '# High-Intensity Interval Training\n\nHIIT alternates between bursts of intense activity and short rest periods, delivering maximum results in minimum time.\n\n## Why HIIT Works\n- Burns more calories in less time than steady-state cardio\n- Creates an "afterburn effect" (EPOC) \u2014 keeps burning calories for hours\n- Improves cardiovascular fitness rapidly\n- Requires no equipment\n\n## Structure\n- 40 seconds work / 20 seconds rest\n- Complete 3 rounds of the circuit\n- 1 minute rest between rounds\n\n## Important\n- Warm up for 3-5 minutes first\n- Modify exercises if needed \u2014 intensity is personal\n- Stay hydrated',
      steps: [
        'Warm up: 2 minutes of light jogging in place and arm circles',
        'Round 1, Exercise 1: Jumping jacks \u2014 40 seconds on, 20 rest',
        'Exercise 2: High knees \u2014 drive knees to chest rapidly',
        'Exercise 3: Burpees \u2014 down to pushup, jump up with arms overhead',
        'Exercise 4: Mountain climbers \u2014 fast alternating knee drives in plank',
        'Exercise 5: Squat jumps \u2014 squat deep, explode up, land soft',
        'Rest 1 minute, then repeat circuit for Round 2',
        'After Round 3, cool down with light walking for 2 minutes',
        'Stretch: quad stretch, hamstring stretch, hip flexor stretch, 30s each'
      ],
      tags: ['hiit', 'cardio', 'no equipment', 'fat burn', 'endurance']
    },
    {
      title: 'Advanced Calisthenics: Muscle-Up Progression',
      description: 'Build the strength and technique to achieve your first muscle-up with a structured progression of pulling and transition drills.',
      category: 'fitness',
      difficulty: 'advanced',
      duration: '35 min',
      thumbnail: '/images/muscleup.jpg',
      content: '# The Muscle-Up\n\nThe muscle-up is the king of bodyweight exercises \u2014 a pull-up that transitions into a dip in one fluid motion. It requires strength, technique, and practice.\n\n## Prerequisites\n- 10+ strict pull-ups\n- 15+ straight bar dips\n- Explosive high pull-ups (chest to bar)\n\n## Equipment\n- Pull-up bar (outdoor bars work great)\n- Resistance bands (for assistance)\n- Chalk (for grip)\n\n## Key Concepts\n- **False grip**: Wrist over the bar, not hanging from fingers\n- **Explosive pull**: Pull fast and high, not slow and controlled\n- **Transition**: The hardest part \u2014 getting your chest over the bar\n- **Kip**: A controlled swing to generate momentum (learn strict first)',
      steps: [
        'Warm up: band pull-aparts, arm circles, 5 regular pull-ups',
        'Practice false grip hangs \u2014 3 sets of 15 seconds',
        'Explosive pull-ups: pull as high as possible, try to touch chest to bar, 5 reps x 3 sets',
        'Negative muscle-ups: jump above bar, slowly lower through the transition, 3 x 3',
        'Band-assisted muscle-ups: loop band over bar, step in, perform full movement, 3 x 3',
        'Straight bar dip practice: start in support position, dip and press, 3 x 8',
        'Transition drills on a low bar: practice the chest-over movement',
        'Attempt full muscle-up: explode upward, pull and lean forward through transition',
        'Cool down: dead hangs, shoulder stretches, wrist stretches'
      ],
      tags: ['calisthenics', 'muscle-up', 'pull-up', 'bodyweight', 'strength']
    },
    // ===== MUSIC =====
    {
      title: 'Piano for Complete Beginners',
      description: 'Learn to read basic sheet music, find notes on the keyboard, and play your first simple melody in one sitting.',
      category: 'music',
      difficulty: 'beginner',
      duration: '20 min',
      thumbnail: '/images/piano.jpg',
      content: '# Your First Piano Lesson\n\nThe piano is one of the most rewarding instruments to learn. Unlike many instruments, you can play both melody and harmony at the same time.\n\n## Getting Oriented\n- The keyboard repeats a pattern of 12 keys (7 white, 5 black)\n- Middle C is your home base \u2014 find it in the center of the keyboard\n- The musical alphabet uses letters A through G, then repeats\n\n## Reading Music\n- The treble clef (right hand) sits on 5 lines: E-G-B-D-F\n- The spaces spell F-A-C-E\n- Each note shape tells you how long to hold it\n\n## Hand Position\n- Curve your fingers like holding a ball\n- Thumbs are finger 1, pinkies are finger 5\n- Keep wrists relaxed and level with the keyboard',
      steps: [
        'Find Middle C on your keyboard \u2014 it\'s the C nearest to the center',
        'Place your right thumb on Middle C, one finger per white key (C-D-E-F-G)',
        'Play each note slowly: C, D, E, F, G and back down G, F, E, D, C',
        'Learn the note names on the treble clef staff: lines (EGBDF) and spaces (FACE)',
        'Practice reading and playing simple whole notes and half notes',
        'Learn "Mary Had a Little Lamb" using notes E-D-C-D-E-E-E',
        'Add your left hand: place pinky on the C below middle C',
        'Practice hands separately, then try both hands together slowly',
        'Play through the full piece 3 times without stopping'
      ],
      tags: ['piano', 'keyboard', 'sheet music', 'beginner', 'melody']
    },
    {
      title: 'Guitar Chord Foundations',
      description: 'Master the 8 essential guitar chords that let you play thousands of songs. No musical experience needed.',
      category: 'music',
      difficulty: 'intermediate',
      duration: '30 min',
      thumbnail: '/images/guitar.jpg',
      content: '# Your Musical Journey Starts Here\n\nWith just 8 chords, you can play approximately 90% of popular songs. This tutorial teaches you each chord with proper finger placement and transitions.\n\n## The Essential 8\nG - C - D - Em - Am - E - A - Dm\n\n## Equipment Needed\n- Any acoustic or electric guitar\n- A guitar pick (optional)\n- A tuner app on your phone\n\n## Practice Strategy\nSpend 2 minutes on each chord, then practice transitions between pairs. Aim for clean, buzz-free sound before moving on.\n\n## Common Mistakes\n- Pressing too hard (you need less pressure than you think)\n- Not curling fingers enough (use fingertips, not pads)\n- Ignoring muted strings\n- Rushing transitions',
      steps: [
        'Tune your guitar using a tuner app (E-A-D-G-B-e)',
        'Learn the G major chord \u2014 strum and check each string rings clearly',
        'Learn C major \u2014 practice the stretch between fingers',
        'Learn D major \u2014 focus on keeping fingers arched',
        'Practice G \u2192 C \u2192 D transitions slowly',
        'Learn Em and Am \u2014 the easiest minor chords',
        'Learn E major, A major, and Dm',
        'Practice the full chord progression: G-Em-C-D',
        'Play your first song using these chords!'
      ],
      tags: ['guitar', 'chords', 'music', 'beginner', 'songs']
    },
    {
      title: 'Music Production: Beat Making',
      description: 'Create a complete hip-hop/electronic beat from scratch using a DAW, including drums, bass, melody, and arrangement.',
      category: 'music',
      difficulty: 'advanced',
      duration: '45 min',
      thumbnail: '/images/beatmaking.jpg',
      content: '# Producing Your First Beat\n\nModern music production is accessible to anyone with a computer. Learn to layer drums, bass, and melodies into a professional-sounding beat.\n\n## Software (DAW)\n- Free: GarageBand, LMMS, BandLab\n- Paid: FL Studio, Ableton Live, Logic Pro\n\n## Key Concepts\n- **BPM (Tempo)**: Hip-hop is typically 80-100 BPM, EDM is 120-140\n- **Time signature**: Most beats are in 4/4 time\n- **Bars**: A standard section is 4 or 8 bars\n- **Layers**: Kick, snare, hi-hat, bass, melody, effects\n\n## The Process\n1. Start with drums (the backbone)\n2. Add bass (the groove)\n3. Layer melodies (the emotion)\n4. Arrange into a full song structure',
      steps: [
        'Open your DAW, set BPM to 90, create a 4-bar loop',
        'Program a kick drum pattern: beats 1 and 3 of each bar',
        'Add snare/clap on beats 2 and 4',
        'Program hi-hats: eighth notes with some velocity variation',
        'Add a bass line using a sub bass or 808 \u2014 follow the kick pattern',
        'Create a 4-bar melody using piano or synth \u2014 keep it simple and catchy',
        'Add variation: change the hi-hat pattern, add rolls and fills',
        'Arrange: Intro (4 bars) \u2192 Verse (8 bars) \u2192 Hook (4 bars) \u2192 repeat',
        'Mix: balance levels, add light reverb to melody, compress drums',
        'Export as WAV and MP3'
      ],
      tags: ['production', 'beats', 'DAW', 'hip-hop', 'electronic']
    },
    // ===== ART =====
    {
      title: 'Pencil Sketching Fundamentals',
      description: 'Learn essential drawing techniques: line control, shading, and perspective that form the foundation of all visual art.',
      category: 'art',
      difficulty: 'beginner',
      duration: '20 min',
      thumbnail: '/images/sketching.jpg',
      content: '# Drawing with Confidence\n\nEveryone can learn to draw. It\'s not about talent \u2014 it\'s about learning to see and translate what you see onto paper.\n\n## Materials\n- Pencils: HB, 2B, 4B, 6B\n- Sketchbook or drawing paper\n- Kneaded eraser\n- Blending stump (optional)\n\n## Core Skills\n1. **Line control**: Drawing straight lines, curves, and circles freehand\n2. **Values**: The range from light to dark (shading)\n3. **Proportion**: Making things the right size relative to each other\n4. **Perspective**: Creating the illusion of depth\n\n## The Artist\'s Mindset\n- Draw what you see, not what you think you see\n- Make lots of mistakes \u2014 that\'s how you learn\n- Practice 15 minutes daily \u2014 consistency beats intensity',
      steps: [
        'Practice basic strokes: parallel lines, hatching, cross-hatching, circles',
        'Create a value scale: 5 boxes from white to darkest black using pencil pressure',
        'Draw a sphere: start with a circle, add shadow and highlight to make it 3D',
        'Practice contour drawing: draw the outline of a simple object without lifting your pencil',
        'Learn one-point perspective: draw a road vanishing to a single point',
        'Sketch a simple still life (a mug or apple) using basic shapes first',
        'Add shading to your still life \u2014 identify light source and shadow areas',
        'Practice gesture drawing: quick 30-second sketches of poses or objects',
        'Combine techniques: complete a detailed sketch with line, value, and perspective'
      ],
      tags: ['drawing', 'sketching', 'pencil', 'shading', 'fundamentals']
    },
    {
      title: 'Watercolor Painting Basics',
      description: 'Discover the fluid, unpredictable beauty of watercolors. Learn essential techniques that bring paintings to life.',
      category: 'art',
      difficulty: 'intermediate',
      duration: '25 min',
      thumbnail: '/images/painting.jpg',
      content: '# Painting with Water and Light\n\nWatercolor is unique among painting mediums \u2014 you paint with light itself, leaving the white paper to glow through transparent layers of color.\n\n## Materials\n- Student-grade watercolor set (12 colors minimum)\n- Watercolor paper (300gsm cold press)\n- Round brushes (sizes 4, 8, 12)\n- Two water containers\n- Paper towels\n\n## Core Techniques\n1. **Wet-on-Wet**: Apply paint to wet paper for soft, dreamy effects\n2. **Wet-on-Dry**: Apply paint to dry paper for sharp, defined edges\n3. **Glazing**: Layer transparent washes for depth\n4. **Lifting**: Remove paint with a damp brush for highlights\n\n## The Golden Rule\nWork from light to dark. You can always add more paint, but you can\'t take it away.',
      steps: [
        'Set up your workspace and tape paper to a board',
        'Practice brush control \u2014 thick and thin lines',
        'Create a color mixing chart with your palette',
        'Practice the wet-on-wet technique with a gradient wash',
        'Practice wet-on-dry for defined shapes',
        'Paint a simple sky using wet-on-wet blending',
        'Add landscape elements using wet-on-dry technique',
        'Experiment with salt texture and splatter effects',
        'Complete a simple landscape combining all techniques'
      ],
      tags: ['watercolor', 'painting', 'art', 'creative', 'techniques']
    },
    {
      title: 'Digital Illustration: Character Design',
      description: 'Design an original character from concept sketches to a polished digital illustration using layers, colors, and lighting.',
      category: 'art',
      difficulty: 'advanced',
      duration: '50 min',
      thumbnail: '/images/digital-art.jpg',
      content: '# Creating Characters Digitally\n\nDigital illustration combines traditional art skills with powerful software tools. Character design is where art meets storytelling.\n\n## Software\n- Free: Krita, FireAlpaca, MediBang Paint\n- Paid: Clip Studio Paint, Procreate (iPad), Photoshop\n\n## Character Design Principles\n- **Silhouette**: A strong character is recognizable from silhouette alone\n- **Shape language**: Circles = friendly, triangles = dangerous, squares = stable\n- **Color palette**: Limit to 3-5 colors that tell the character\'s story\n- **Personality**: Every design choice should reflect who the character is\n\n## Layer Workflow\n1. Rough sketch layer (low opacity)\n2. Clean lineart layer\n3. Flat colors layer (under lineart)\n4. Shading layer (multiply blend mode)\n5. Highlights layer (screen blend mode)',
      steps: [
        'Brainstorm your character: write down personality traits, backstory, role',
        'Do 10 quick thumbnail sketches exploring different body shapes and poses',
        'Choose your favorite and create a larger rough sketch on a new canvas',
        'Refine the rough into clean lineart on a separate layer \u2014 smooth, confident lines',
        'Create a flat colors layer beneath the lineart \u2014 block in base colors',
        'Add a shading layer (multiply mode): paint shadows based on a light source',
        'Add highlights layer (screen mode): paint where light hits brightest',
        'Refine details: add texture to clothing, sparkle to eyes, patterns',
        'Paint a simple background that complements the character',
        'Final adjustments: color balance, contrast, and export at high resolution'
      ],
      tags: ['digital art', 'character design', 'illustration', 'layers', 'coloring']
    },
    // ===== GAMES =====
    {
      title: 'Chess Basics: Rules & Pieces',
      description: 'Learn how every chess piece moves, the rules of the game, and basic tactics to start playing confidently.',
      category: 'games',
      difficulty: 'beginner',
      duration: '15 min',
      thumbnail: '/images/chess-basics.jpg',
      content: '# Welcome to Chess\n\nChess is a game of strategy played on an 8x8 board. Two players take turns moving pieces with the goal of checkmating the opponent\'s king.\n\n## The Pieces\n- **King**: Moves one square in any direction (most important piece)\n- **Queen**: Moves any number of squares in any direction (most powerful)\n- **Rook**: Moves horizontally or vertically any number of squares\n- **Bishop**: Moves diagonally any number of squares\n- **Knight**: Moves in an "L" shape \u2014 the only piece that can jump\n- **Pawn**: Moves forward one square (two on first move), captures diagonally\n\n## Special Moves\n- **Castling**: King and rook swap positions for safety\n- **En passant**: A special pawn capture\n- **Promotion**: A pawn reaching the back rank becomes any piece\n\n## Winning\nCheckmate = the king is attacked and cannot escape. Game over!',
      steps: [
        'Set up the board: each player gets 16 pieces in the correct starting positions',
        'Learn how the pawn moves: forward one (or two from starting position), captures diagonally',
        'Learn rook movement: straight lines, any number of squares',
        'Learn bishop movement: diagonals only, stays on its starting color',
        'Learn the queen: combines rook and bishop \u2014 the most powerful piece',
        'Learn the knight: L-shaped jumps, the only piece that can hop over others',
        'Learn king movement and the concept of check and checkmate',
        'Practice castling: king moves two squares toward rook, rook jumps over',
        'Play a practice game applying all the rules you learned'
      ],
      tags: ['chess', 'rules', 'pieces', 'beginner', 'strategy']
    },
    {
      title: 'Chess Tactics: Forks, Pins & Skewers',
      description: 'Master the three most important tactical patterns in chess that win material and create winning positions.',
      category: 'games',
      difficulty: 'intermediate',
      duration: '25 min',
      thumbnail: '/images/chess-tactics.jpg',
      content: '# Tactical Patterns\n\nTactics are short sequences of moves that win material or create threats. Recognizing patterns is the fastest way to improve your chess.\n\n## The Big Three\n1. **Fork**: One piece attacks two or more enemy pieces simultaneously\n2. **Pin**: A piece can\'t move because it would expose a more valuable piece behind it\n3. **Skewer**: Like a reverse pin \u2014 the more valuable piece is in front and must move\n\n## Why Tactics Matter\n- Grandmasters estimate that 90% of chess is tactics\n- Most games at club level are decided by tactical oversights\n- Pattern recognition improves with regular practice\n\n## Practice Method\n- Solve tactical puzzles daily (Chess.com, Lichess)\n- Start with 1-move tactics, progress to 2-3 move combinations\n- Review your games and find missed tactics',
      steps: [
        'Learn knight forks: a knight attacking king and rook simultaneously',
        'Practice recognizing fork opportunities in example positions',
        'Learn absolute pins: a piece is pinned to the king and cannot legally move',
        'Learn relative pins: a piece is pinned to a valuable piece (queen, rook)',
        'Practice pinning opponents\' pieces in example positions',
        'Learn skewers: attack a valuable piece that must move, capture what\'s behind',
        'Combine patterns: find positions where fork + pin work together',
        'Solve 10 tactical puzzles using the patterns you learned',
        'Analyze one of your games and identify all tactical opportunities'
      ],
      tags: ['chess', 'tactics', 'forks', 'pins', 'puzzles']
    },
    {
      title: 'Chess Opening Strategies',
      description: 'Control the board from move one. Learn the principles and popular openings that grandmasters use.',
      category: 'games',
      difficulty: 'advanced',
      duration: '20 min',
      thumbnail: '/images/chess.jpg',
      content: '# The First Battle\n\nThe opening is where wars are won and lost. A strong opening gives you control, development, and initiative.\n\n## Three Pillars of Opening Play\n1. **Control the Center** \u2014 d4, d5, e4, e5 are the most important squares\n2. **Develop Your Pieces** \u2014 Knights and bishops out before the queen\n3. **King Safety** \u2014 Castle early, preferably kingside\n\n## Popular Openings\n- **Italian Game** (1.e4 e5 2.Nf3 Nc6 3.Bc4) \u2014 Classic, aggressive\n- **Queen\'s Gambit** (1.d4 d5 2.c4) \u2014 Positional mastery\n- **Sicilian Defense** (1.e4 c5) \u2014 Counter-attacking favorite\n- **King\'s Indian** (1.d4 Nf6 2.c4 g6) \u2014 Hypermodern approach\n\n## Mistakes to Avoid\n- Moving the same piece twice in the opening\n- Bringing the queen out too early\n- Neglecting development for pawn grabbing\n- Ignoring your opponent\'s threats',
      steps: [
        'Understand the three opening principles: center, development, safety',
        'Learn the Italian Game as White \u2014 practice the first 5 moves',
        'Learn the Sicilian Defense as Black against 1.e4',
        'Study the Queen\'s Gambit \u2014 understand accepted vs declined',
        'Practice recognizing common traps (Scholar\'s Mate, Legal\'s Mate)',
        'Play through 3 famous grandmaster opening sequences',
        'Analyze your own games \u2014 identify opening mistakes',
        'Build a personal opening repertoire for White and Black'
      ],
      tags: ['chess', 'strategy', 'openings', 'competitive', 'thinking']
    }
  ];

  await Tutorial.insertMany(tutorials);
  console.log('Database seeded with tutorials.');
}

module.exports = seed;
