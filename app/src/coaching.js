// ─────────────────────────────────────────────────────────
// Coaching knowledge layer — the brain behind Jay's elite coach.
// Per-discipline tier DRILLS, the cross-discipline athletic
// FOUNDATIONS most movement athletes neglect, and a blindspot
// analyzer that reads his skill tree + recent training + readiness
// to catch what's holding him back from being a well-rounded,
// durable, elite all-around acrobat.
//
// Sources of truth: artistic gymnastics & tumbling progressions,
// FIG-style body-line work, hand-balancing & partner-acro methodology,
// calisthenics/street-workout straight-arm strength science, tricking
// (flips/twists) air-awareness drills, parkour landing/precision
// fundamentals, and ninja grip/lache training — plus sports science
// (periodization, eccentric/landing mechanics, tissue prep).
// ─────────────────────────────────────────────────────────

// ── Drills keyed by discipline → tier. Each tier is an ORDERED teaching
//    sequence — do them top to bottom; each builds on the last. Every
//    drill has a `cue` (the coaching key) and a `gate` (the measurable
//    standard that means you've earned the next step). Don't chase the
//    skill before the gate before it is green.
export const DRILLS = {
  gymnastics: {
    // THE FOUNDATION OF EVERYTHING. Shapes → tissue prep → static handstand
    // → balance off the wall → basic rotation. Master this and every other
    // discipline gets easier; skip it and you hit a ceiling everywhere.
    Foundation: [
      { name: '1. Body-line holds: hollow → arch', cue: 'Hollow: posterior pelvic tilt, low back glued down, ribs in, arms by ears. Arch: glutes on, reach long. These two shapes ARE gymnastics.', gate: '30s clean hollow + 30s arch, no breaks.', fault: 'Low back peels off the floor in hollow → tilt the pelvis, drive the belt buckle toward the chin, press the back flat.' },
      { name: '2. Hollow & arch rocks', cue: 'Hold one rigid shape and rock from the shoulders/heels — the line never changes.', gate: '20 controlled reps each, line held.', fault: 'Breaking at the hips mid-rock → keep the shape locked; initiate the rock from the extremities, not by piking.' },
      { name: '3. Wrist & shoulder prep (do this BEFORE handstands)', cue: 'Wrist CARs + flexor/extensor loading, scap push-ups, shoulder dislocates. Open and bulletproof the joints you are about to load.', gate: 'Pain-free loaded wrist extension; full overhead reach.', fault: 'Skipping prep and going straight to handstands → wrist/elbow tendinopathy that stalls everything. Never skip this.' },
      { name: '4. Chest-to-wall handstand', cue: 'Stomach to wall, walk the feet up, push tall through the shoulders, ribs down, hips stacked over hands.', gate: '60s chest-to-wall, ears covered.', fault: 'Banana — hips piked away from the wall, ribs flared → squeeze glutes, posterior tilt, drive tall through the shoulders.' },
      { name: '5. Back-to-wall HS + shoulder taps', cue: 'Kick up near the wall, find the balance line, alternate light controlled taps.', gate: '10 controlled taps each shoulder.', fault: 'Falling into the wall / over-arching → stack shoulders over hands, shift weight subtly, do not dump the hips.' },
      { name: '6. Kick-up to freestanding balance + pirouette bail', cue: 'Step, reach long, kick to vertical only, claw the fingers. Learn to pirouette/turn out when you overbalance.', gate: '5s freestanding from a kick-up + a confident bail.', fault: 'Kicking too hard and falling flat → kick only to vertical, catch with the fingertips; if you go over, turn out — never crash.' },
      { name: '7. Forward/back rolls + candlestick to stand', cue: 'Round the spine, stay tight, drive up with no hands on the stand.', gate: 'Smooth roll to stand both directions, no hands.', fault: 'Pushing off the floor to stand → stay hollow and use the rock momentum, not the hands.' },
    ],
    // Freestanding balance → round-off power → back flexibility → press strength.
    Developing: [
      { name: '1. Freestanding HS balance (toe pulls, finger balance)', cue: 'Balance from the fingertips: press fingers to stop a forward fall, release to stop a backward one.', gate: '30s freestanding handstand.', fault: 'Correcting from the hips (banana) instead of the fingers → keep the line rigid, all micro-corrections come from the hands.' },
      { name: '2. Cartwheel → round-off technique', cue: 'Hand–hand–foot–foot; snap the heels together under the hips, finish tall and square to the start.', gate: 'Powerful round-off rebound to two feet, chest up.', fault: 'Round-off lands wide, loose, chest-down → snap the legs together fast, block through the shoulders, stand tall.' },
      { name: '3. Round-off rebound (block)', cue: 'Punch the floor through locked arms, rebound up AND slightly back, arms pinned by the ears.', gate: 'Tall rebound, hips open, stuck.', fault: 'Rebounding straight up or collapsing forward → block off the hands, keep the body hollow and tall, travel slightly backward.' },
      { name: '4. Bridge mobility → bridge kick-over (limber prep)', cue: 'Push to the fingertips toward the heels; shift the shoulders past the hands, open the thoracic.', gate: 'Straight-arm bridge with shoulders open over the hands.', fault: 'Bending only from the low back → push through the shoulders and mid-back; if shoulders are tight, mobilize first.' },
      { name: '5. Straddle/pike press negatives', cue: 'Lower slowly from the handstand — lean the shoulders forward to counterbalance, compress tight, straight arms.', gate: '5 slow controlled press negatives.', fault: 'Swinging or bending the arms down → slow eccentric only; the forward lean and compression do the work, not momentum.' },
    ],
    // Back flexibility skills → BHS → press strength → straight-arm crossover.
    Advanced: [
      { name: '1. Front & back walkovers', cue: 'Split the legs early, lead with the chest, push the shoulders open through the bridge.', gate: 'Controlled walkover both directions.', fault: 'Legs together, no split, dumping the low back → split early and lead with the chest, not the hips.' },
      { name: '2. BHS prep: tabletop sit → jump back over barrel → to spotter', cue: 'Sit BACK like into a chair, jump backward (not up), delay the head, blind reach, push through the shoulders, snap down.', gate: 'Back handspring over a barrel solo.', fault: 'Jumping up and throwing the head early → sit back first, keep the head neutral until the hands reach, then push.' },
      { name: '3. Standing BHS → step-out / connection', cue: 'Keep the set tall, hands hit, block through the shoulders, snap the feet down under the hips.', gate: 'Standing BHS stuck, no spot.', fault: 'Piking down on the landing / under-pushing → keep the chest up, block hard off the hands, feet land under you.' },
      { name: '4. Straddle → pike press to handstand', cue: 'Straight arms, hips lead, compression and a forward shoulder lean drive it — zero swing.', gate: 'Straddle press to handstand.', fault: 'Bending the arms or jumping into it → straight arms only; build the compression and lean to earn it.' },
      { name: '5. Planche lean → tuck planche (straight-arm crossover)', cue: 'Protract the scapula hard, lean the shoulders well past the wrists, lock the elbows.', gate: '10s tuck planche.', fault: 'Shoulders behind the wrists, scapula retracted → protract and lean further forward; the lean is the strength.' },
    ],
    // Air-awareness off height → flat → line skills → twisting → one-arm balance.
    Elite: [
      { name: '1. Back tuck: set + jump back off raised mat → into pit', cue: 'Full tall arm-set and a backward jump BEFORE you tuck — height first, then rotation; spot the floor coming down.', gate: 'Back tuck into pit/resi, consistent.', fault: 'Tucking before setting (low, no height, throws under) → complete the tall set first, then snap the tuck.' },
      { name: '2. Standing back tuck on flat', cue: 'Same set; commit, snap the knees to the chest, open to spot the landing, stick it.', gate: 'Standing back tuck stuck on flat.', fault: 'Throwing back and under-rotating from fear → commit and set vertical; hesitation is what makes it dangerous.' },
      { name: '3. Whip → layout line drills', cue: 'Hollow–arch–hollow; drive the hips, keep straight legs, delay the open.', gate: 'Whip-back with a tight, traveling line.', fault: 'Opening early and piking the layout → delay the open, drive the hips through, hold the line.' },
      { name: '4. Twisting intro: late-twist drills → half-twist layout', cue: 'Finish the set first, then initiate the twist LATE and tight from the shoulders/hips.', gate: 'Clean half-twisting layout.', fault: 'Twisting early kills the rotation and the height → set fully, twist late, stay tight.' },
      { name: '5. One-arm HS: weight shift → fingertip balance → one-arm leans → brief OAHS', cue: 'Shift the hips fully over the post hand, square the shoulders, all corrections from the fingers.', gate: '3–5s one-arm handstand.', fault: 'Hips lagging behind the post arm → stack the hips directly over the supporting hand before lifting the other.' },
    ],
  },
  tricking: {
    // Kicks, vert, and clean setups are non-negotiable before any flip.
    Foundation: [
      { name: '1. Stance, weight transfer & base kicks (round, hook, crescent)', cue: 'Chamber, snap, retract; stay tall over the base leg. Clean kicks are the alphabet of tricking.', gate: 'Balanced controlled kicks both legs.', fault: 'Leaning back / dropping the chest on the kick → stay tall over the base leg, snap from the chamber.' },
      { name: '2. Tornado kick: pop 360 → 540', cue: 'Vertical pop, spot early, late kick; land on the kicking leg.', gate: 'Clean pop 540, landed in control.', fault: 'Traveling and twisting flat/low → pop vertical first, then add the late kick.' },
      { name: '3. Setups: cartwheel, round-off, J-step, hyper-hook', cue: 'Master the entries cold — sloppy setups cap every flip you ever learn.', gate: 'Consistent J-step / round-off into vertical.', fault: 'Rushing sloppy setups → slow them down and make them automatic; speed is built last.' },
      { name: '4. Round-off rebound / jump-back (the flip engine)', cue: 'Block off the hands, rebound tall and slightly back, arms by the ears — this powers every backward flip.', gate: 'Tall powerful rebound, hips open.', fault: 'Throwing the head/shoulders back instead of blocking up → punch the floor, stay hollow, rebound up first.' },
    ],
    // Gateway inverts & twists, learned OFF elevation for air-awareness, then flat.
    Developing: [
      { name: '1. Aerial / side aerial (no-hand cartwheel) off a box → flat', cue: 'Reach long over the lead leg, hollow body, kick-punch the legs through.', gate: 'Aerial stuck on flat ground.', fault: 'Putting a hand down or piking → commit to the reach, stay hollow, drive the kick-punch.' },
      { name: '2. Butterfly kick → butterfly twist (btwist) off elevation → flat', cue: 'Bkick for the shape, then add the backside twist: set vertical, twist late and tight.', gate: 'Btwist landed on flat.', fault: 'Twisting before setting → establish the backside takeoff and height first, then twist late.' },
      { name: '3. Cheat 720 (twisting kick)', cue: 'Cheat the setup, stay over the base, complete the full rotation before landing.', gate: 'Cheat 720 stuck on the kicking leg.', fault: 'Opening the twist early and under-rotating → stay tight and finish the spin before reaching for the floor.' },
      { name: '4. Swing-through / masterscoop transitions', cue: 'Build momentum and rotation control — these feed your gainers and corks.', gate: 'Smooth swing-through that sets up a flip.', fault: 'No momentum control into the trick → drill the swing/scoop until the entry is effortless.' },
    ],
    // First true flips: gainer (forward travel), cork (off-axis), raiz, then the full.
    Advanced: [
      { name: '1. Gainer (gainer flash) off elevation → flat', cue: 'Travel forward off one leg, flip backward; spot the takeoff foot.', gate: 'Gainer landed on flat.', fault: 'Jumping backward instead of traveling forward → commit forward off the one foot while flipping back.' },
      { name: '2. Cork (corkscrew) off box → into mat → flat', cue: 'Hurdle, set LOW and diagonal, dump the head late, complete the rotation before opening.', gate: 'Cork landed feet-first on flat.', fault: 'Setting too upright (it becomes a btwist) → set low and diagonal, commit the off-axis dump.' },
      { name: '3. Raiz / touchdown raiz', cue: 'Inverted-cartwheel feel, snap the legs through, finish tall.', gate: 'Raiz stuck, chest up.', fault: 'Landing chest-down → snap the legs through fully and pull the chest up to finish.' },
      { name: '4. Full (full-twisting layout)', cue: 'From a round-off BHS or standing: set the layout fully, then a late, tight full twist.', gate: 'Full twist landed and stuck.', fault: 'Twisting early kills the rotation and the height → complete the set, twist late.' },
    ],
    // Own the base cork → flavor it → double → multi-twist → combos.
    Elite: [
      { name: '1. Cork variations (hook, swipe, touchdown, shuriken)', cue: 'Own the clean base cork before adding any flavor; one variation at a time.', gate: '2–3 cork variations landed clean.', fault: 'Flavoring before the base cork is clean → perfect the plain cork first, then add variations.' },
      { name: '2. Double cork into pit/tramp → resi → flat', cue: 'Set higher off the single, two tight rotations, eyes find the floor early.', gate: 'Double cork into soft consistently.', fault: 'Not setting higher off the single → you need more height and a tighter first rotation, not more throw.' },
      { name: '3. Double full / multi-twisting layouts', cue: 'Earn off the single full; set higher, two tight late twists, hold the line.', gate: 'Double full landed.', fault: 'Rushing the twist or under-setting → more set and height, then twist late and tight.' },
      { name: '4. Combos / linking under fatigue', cue: 'Link only what is automatic; control the landing of trick one to launch trick two.', gate: 'Clean 3-trick combo, controlled throughout.', fault: 'Linking before each trick is automatic → master the singles, then connect them.' },
    ],
  },
  calisthenics: {
    // Scap control + full-ROM basics + legs. Build the pulling base early.
    Foundation: [
      { name: '1. Scap pulls / pushups / dips', cue: 'Move the shoulder blades FIRST — own protraction, retraction, depression.', gate: '10 controlled reps of each.', fault: 'Moving from the elbows not the scapula → isolate the shoulder blades; arms stay straight.' },
      { name: '2. Full-ROM pull-ups, dips, pushups, rows', cue: 'Build strict strength and BALANCE pushing with pulling from day one.', gate: '10 pull-ups · 15 dips · 20 pushups · 10 rows, strict.', fault: 'All push, little pull (the classic imbalance) → match every pressing set with a pulling set.' },
      { name: '3. Pistol squat + Nordic curl progression', cue: "Don't be all upper body — single-leg strength + hamstring eccentric protect the knees.", gate: 'Clean pistol each leg; 1/2-range Nordic.', fault: 'Neglecting legs/hamstrings entirely → they protect the knees and power every jump and landing.' },
    ],
    // Tuck statics + the muscle-up + compression/overhead.
    Developing: [
      { name: '1. Tuck front-lever hold → raises', cue: 'Straight arms, posterior pelvic tilt, pull the bar toward the hips.', gate: '10s tuck FL + 5 raises.', fault: 'Bent arms or anterior pelvic tilt → lock the elbows, tuck the pelvis, pull from the lats.' },
      { name: '2. Explosive pull-ups → negative MU → muscle-up', cue: 'Pull high to the navel, fast turnover, keep the bar path tight.', gate: '3 clean bar muscle-ups.', fault: 'Chicken-winging / slow transition → pull higher and turn over faster; train the negative.' },
      { name: '3. L-sit + wall HSPU', cue: 'Active compression for the L-sit; full range overhead on the HSPU.', gate: '15s L-sit · 5 wall HSPU full ROM.', fault: 'Half-range HSPU / piked-down L-sit → full overhead lockout; actively compress and lift the L-sit.' },
    ],
    // Open the levers to straddle; planche from leans; freestanding press.
    Advanced: [
      { name: '1. Adv-tuck → straddle front lever', cue: 'Open the tuck slowly; arms straight, body rigid-hollow the whole time.', gate: '5s straddle front lever.', fault: 'Opening the tuck too fast or bending the arms → progress the lever arm gradually, stay rigid.' },
      { name: '2. Planche: leans → tuck → adv-tuck → straddle', cue: 'Lean past the wrists, scapula protracted, straight arms — tendons adapt slowly, be patient.', gate: '10s advanced-tuck planche.', fault: 'Rushing the volume → elbow/bicep-tendon overuse; ramp slowly and deload.' },
      { name: '3. Freestanding HSPU + human flag', cue: 'Top arm pulls, bottom arm presses; stack and brace the whole body.', gate: 'Freestanding HSPU; 5s flag.', fault: 'Banana HSPU losing balance → keep a hollow line and full overhead lockout.' },
    ],
    // Full statics and one-arm strength — connective-tissue patience.
    Elite: [
      { name: '1. Full front lever → pulls/touches', cue: 'Rigid hollow line, pull from straight-arm lats.', gate: 'Full FL 5s hold.', fault: 'Hips sagging out of line → squeeze the whole body into one rigid plank.' },
      { name: '2. Full planche → planche pushups', cue: 'Straight-arm strength is connective tissue — protect the elbow, ramp volume slowly.', gate: 'Full planche 3s.', fault: 'Jumping volume and tweaking the elbow → small progressive loads, plenty of recovery.' },
      { name: '3. One-arm pull-up: archer → assisted → weighted negatives', cue: 'Build the elbow gradually; never rush the connective tissue.', gate: 'Controlled weighted OAP negative.', fault: 'Yanking with the whole body → strengthen the elbow with slow weighted negatives first.' },
    ],
  },
  acro: {
    // Solo handstand mastery + base/flyer fundamentals come before any height.
    Foundation: [
      { name: '1. Solo handstand line + endurance', cue: 'Your handstand IS your base — own a long, straight, quiet one before partner work.', gate: '45s freestanding straight HS.', fault: 'Going to partner work on a shaky handstand → fix the solo HS first; everything in acro rides on it.' },
      { name: '2. Base fundamentals: bird/throne, counterbalances', cue: 'Stack flyer over base hips, locked arms, load straight through the bones; trust opposing tension.', gate: 'Stable 15s counterbalance / bird.', fault: 'Bent arms / loading through muscle instead of bone → stack and lock; let the skeleton hold the weight.' },
      { name: '3. Foot-to-hand setup (L-base)', cue: 'Flyer rises tall and hollow; base locks arms and drives straight up.', gate: 'Stable 10s foot-to-hand.', fault: 'Flyer leaning or base pushing unevenly → flyer stays hollow and vertical, base drives straight up evenly.' },
    ],
    // Static height + the low hand-to-hand entry.
    Developing: [
      { name: '1. Shoulder stand → 2-high', cue: 'Base braces overhead; flyer finds the line tall, quiet, patient.', gate: '10s stable 2-high.', fault: 'Flyer rushing up before the base is set → wait for the brace, then rise slow and quiet.' },
      { name: '2. Whip-up / straight-leg-up to foot-to-hand', cue: 'Time the dip-drive together; flyer stays hollow and waits for the line.', gate: 'Consistent dynamic entry to f2h.', fault: 'Mis-timed dip-drive → count it together; flyer is patient, base drives on the agreed beat.' },
      { name: '3. Low hand-to-hand (L-base)', cue: 'Wrist-to-wrist, stacked bones, balance from the fingers — flyer hollow.', gate: '5s low H2H.', fault: 'Gripping hard with unstacked wrists → stack the bones and balance from the fingers, relax the grip.' },
    ],
    // Static H2H, then add dynamics.
    Advanced: [
      { name: '1. Hand-to-hand (H2H) static', cue: 'Straight-arm base, flyer line stacked over the base shoulders — breathe and hold.', gate: '10s H2H hold.', fault: 'Bent base arms / flyer banana → lock the base arms, flyer stacks a straight line over the base shoulders.' },
      { name: '2. Pop-ups / partner press entries', cue: 'Drive through the legs, sync the count, soft controlled catches.', gate: 'Clean press entry to H2H.', fault: 'Yanking the entry with the arms → drive through the legs and time the count together.' },
      { name: '3. Dynamic washing-machines', cue: 'Continuous tension, smooth transitions, eyes up the whole rotation.', gate: 'One full washing-machine cycle controlled.', fault: 'Losing tension between positions → maintain continuous tension and keep the eyes up.' },
    ],
    // Standing-level and dynamic throws — years of base under it.
    Elite: [
      { name: '1. Standing hand-to-hand', cue: 'Earned off bulletproof HS + low H2H; tiny constant corrections, calm.', gate: 'Standing H2H 3–5s.', fault: 'Tension and panic → stay calm, make tiny corrections, trust the accumulated reps.' },
      { name: '2. Dynamic pitches & tempos (throws/catches)', cue: 'Commit fully, time the catch, control the landing arc.', gate: 'Consistent caught pitch.', fault: 'Half-committing the throw or catch → commit fully and time it; hesitation causes the misses.' },
      { name: '3. One-arm flag / advanced one-arm work', cue: 'Built on years of straight-arm and balance — patience over ego.', gate: 'Held one-arm shape with base.', fault: 'Chasing it before the base strength is there → build years of straight-arm work first.' },
    ],
  },
  parkour: {
    // Land safely FIRST, then precision/balance, then basic vaults.
    Foundation: [
      { name: '1. Landing mechanics + safety roll (both sides)', cue: 'Land quiet on the balls, absorb ankle→knee→hip; roll diagonally over the shoulder, never the spine.', gate: 'Silent drop landing + smooth roll both sides.', fault: 'Landing stiff/loud or rolling on the spine → bend and absorb softly; roll shoulder-to-opposite-hip.' },
      { name: '2. Two-foot precision jumps (accuracy ladder)', cue: 'Arms set the balance, stick it dead on the rail/edge — no wobble, no step.', gate: '10/10 stuck rail precisions.', fault: 'Wobbling or stepping out on landing → start lower, use the arms to balance, stick it dead.' },
      { name: '3. Balance, QM & basic vaults (safety, step, lazy)', cue: 'Move efficiently — light hands, eyes ahead.', gate: 'Clean safety/step/lazy vaults at pace.', fault: 'Heavy hands and eyes down → light contact, look where you are going.' },
    ],
    // First dynamic vaults and wall work.
    Developing: [
      { name: '1. Kong/monkey vault — progressive distance', cue: 'Dive early, push long off the hands, tuck the knees through.', gate: 'Kong over a wide obstacle, controlled.', fault: 'Diving late and clipping the knees → dive earlier, push long off the hands, tuck through.' },
      { name: '2. Cat leap → climb-up', cue: 'Absorb on the wall, then pull and rotate over the top.', gate: 'Controlled cat-to-top, no scramble.', fault: 'Slamming into the wall and scrambling → absorb on contact, then pull and rotate smoothly.' },
      { name: '3. Wall run (tac) height ladder', cue: 'Attack the wall, drive the knee, reach tall.', gate: 'Consistent tac to a high grab.', fault: 'Running flat into the wall → drive the knee upward and reach tall, convert speed to height.' },
    ],
    // Combine: dynamic vault to a precise, often gapped, landing.
    Advanced: [
      { name: '1. Kong-precision: flat → gap', cue: 'Control the float, spot the landing, stick it quiet.', gate: 'Kong-pre over a gap, stuck silent.', fault: 'Over-rotating or not spotting the landing → control the float, eyes on the landing, stick it.' },
      { name: '2. Running & stride precisions on rails', cue: 'Rhythm and confidence; commit fully to the stick.', gate: 'Stuck running precision to a rail.', fault: 'Hesitating mid-stride → keep the rhythm and commit fully to the landing.' },
      { name: '3. Underbars, dash-to-cat, larger gaps', cue: 'Carry speed through technique; scout before you send.', gate: 'Linked vault-to-cat at pace.', fault: 'Losing speed through poor technique → flow the movement; scout the line before committing.' },
    ],
    // Flips on walls and big lines — ground-proven first.
    Elite: [
      { name: '1. Wall flips / wall spins (matted first)', cue: 'Earned off tricking flips + solid wall runs; commit, spot, land soft.', gate: 'Wall flip stuck off a wall.', fault: 'Sending un-matted or under-committing → mats first, then commit fully; half-effort is what hurts you.' },
      { name: '2. Gainers off walls / dynamic flips into lines', cue: 'Spot the takeoff, control rotation, land in balance to keep flowing.', gate: 'Flip linked into a moving line.', fault: 'Landing off-balance and stopping → control the rotation to land in balance and keep moving.' },
      { name: '3. Big high-consequence lines', cue: 'Only send when every single move is 100% on the ground first.', gate: 'Full line, every move pre-proven.', fault: 'Sending un-proven moves at height → prove every move at ground level before linking the line.' },
    ],
  },
  ninja: {
    // Grip + pulling base + the swing-release, before distance.
    Foundation: [
      { name: '1. Grip ladder: dead hang → towel → pinch/round-rung', cue: 'Grip is the gatekeeper — build hang time and finger tolerance; relax between, never death-grip.', gate: '60s dead hang · 30s towel hang.', fault: 'Over-gripping and gassing the forearms → relax between holds and build tolerance gradually.' },
      { name: '2. Active hang + scap pulls + strict pull-ups', cue: 'A strong pull underlies every obstacle.', gate: '10 strict pull-ups; controlled active hang.', fault: 'Passive dead-hanging only → train the active scap hang and a strict pulling base.' },
      { name: '3. Short lache (swing-release) to catch', cue: 'Swing from the shoulders, release at the peak of the swing, catch soft.', gate: 'Clean short lache, caught and controlled.', fault: 'Releasing too early or too late → release at the peak of the swing, let momentum carry you.' },
    ],
    // Distance, the warped wall, and grip transitions.
    Developing: [
      { name: '1. Lache distance ladder (varied grips)', cue: 'Generate from the swing, release late, regrip soft and absorb.', gate: 'Consistent long lache between bars.', fault: 'Pulling with the arms instead of swinging → power comes from the swing; the arms just regrip.' },
      { name: '2. Warped wall run-up', cue: 'Attack the wall, last steps high, reach long at the top.', gate: '14 ft warped wall.', fault: 'Slowing down at the base of the wall → accelerate into it, keep the last steps high.' },
      { name: '3. Grip transitions (cannonball, lap bar, rings)', cue: 'Smooth re-grips; conserve the forearms across holds.', gate: 'Linked 3-obstacle grip transition.', fault: 'Forearms blowing up mid-transition → smooth, efficient re-grips; conserve grip for the whole sequence.' },
    ],
    // Fingertip strength and explosive grip.
    Advanced: [
      { name: '1. Cliffhanger / ledge traverse', cue: 'Fingertip strength + body tension; move from the back and hips, not just the arms.', gate: 'Traverse a cliffhanger ledge.', fault: 'All arms, no body tension → engage the back and core; move from the hips, save the fingers.' },
      { name: '2. Salmon ladder', cue: 'Explosive kip, drive both ends of the bar up together, control the catch.', gate: 'Salmon ladder rung-to-rung x3.', fault: 'Driving the bar unevenly → kip explosively and pop both ends up together.' },
      { name: '3. Pegboard / dynamic grip moves', cue: 'Tight core, deliberate placements, save the forearms.', gate: 'Pegboard up-and-over.', fault: 'Frantic, rushed placements → stay tight and deliberate; speed wastes grip.' },
    ],
    // Max fingertip + course pacing under fatigue.
    Elite: [
      { name: '1. Ultimate cliffhanger / floating boards', cue: 'Max fingertip strength + lache precision under fatigue.', gate: 'Dynamic fingertip move caught clean.', fault: 'Grip gassing under fatigue → train fingertip moves while already tired, not just fresh.' },
      { name: '2. Devil steps, floating doors, comp obstacles', cue: 'Train the full sequence, not just the single move.', gate: 'Linked competition obstacle cluster.', fault: 'Drilling only single moves → rehearse full obstacle sequences as they appear in comp.' },
      { name: '3. Competition-pace circuits', cue: 'Grip endurance is the limiter — train it fresh AND deeply fatigued; pace it across the course.', gate: 'Full course pace without a grip blow-out.', fault: 'Pacing too hot early and blowing the grip → manage grip output across the whole course.' },
    ],
  },
};

// ── The athletic foundations under everything. Most movement athletes
//    obsess over skills and quietly neglect these — which is exactly
//    where injuries and plateaus come from.
export const FOUNDATIONS = [
  { id: 'wrist', name: 'Wrist & elbow prep', why: 'Hand-balancing, planche, and tumbling load the wrists/elbows hard. Skip prep and you get tendinopathy that sidelines everything.', drills: ['Wrist CARs + flexor/extensor curls', 'Knuckle & fingertip pushups', 'Tiger-bend & elbow-pit conditioning'] },
  { id: 'shoulder', name: 'Shoulder & scapular strength + mobility', why: 'Overhead line, straight-arm strength, and catches all live here. Weak/locked shoulders cap your handstand and your acro base.', drills: ['Scap CARs + Y/T/W raises', 'German hang + shoulder dislocates', 'Overhead support holds'] },
  { id: 'spine', name: 'Thoracic & spinal mobility', why: 'Bridges, walkovers, aerials, and a tall line need an open thoracic — not just a cranky low back doing all the bending.', drills: ['Bridge progressions / wall walks', 'Jefferson curls (light, slow)', 'Segmental cat-cow + thoracic CARs'] },
  { id: 'hips', name: 'Hip & ankle mobility', why: 'Splits and pancake feed kicks, presses, and clean lines; ankle dorsiflexion = depth and soft landings.', drills: ['Front + middle split work', 'Pancake / Cossack squats', 'Banded ankle dorsiflexion'] },
  { id: 'straightarm', name: 'Straight-arm / connective-tissue strength', why: 'Planche, levers, presses, and acro bases are built on straight-arm strength — tendons adapt slowly, so this is the long game.', drills: ['Planche & lever leans', 'Tuck planche / tuck FL holds', 'Pseudo-planche pushups'] },
  { id: 'pull', name: 'Pull / push balance', why: 'Trickers and handbalancers over-push and under-pull. Imbalance wrecks shoulders and stalls progress. Match your pressing with pulling.', drills: ['Weighted pull-ups & rows', 'Front-lever pulls', 'Face-pulls / band pull-aparts'] },
  { id: 'posterior', name: 'Posterior chain & legs', why: 'Jumps, kicks, sets, and landings come from hamstrings, glutes, and calves. Skinny-leg syndrome limits height and risks the knees.', drills: ['Nordic hamstring curls', 'Single-leg RDL + squat', 'Pogo / depth-jump landings'] },
  { id: 'core', name: 'Core line & compression', why: 'Hollow/arch control and active compression are the through-line of every skill — the difference between a clean line and a banana.', drills: ['Hollow rocks + arch holds', 'V-ups / pike compressions', 'Copenhagen + anti-rotation'] },
  { id: 'landing', name: 'Landing & eccentric control', why: 'The most-skipped pillar and the #1 injury source. Train absorbing force — your knees, ankles, and longevity depend on it.', drills: ['Depth landings (stick + absorb)', 'Eccentric step-downs', 'Roll mechanics on all sides'] },
  { id: 'capacity', name: 'Work capacity & recovery', why: 'Ninja/parkour fail late from fatigue, not lack of skill. Build the engine — and respect recovery so adaptation actually happens.', drills: ['Grip & circuit conditioning', 'Zone-2 base + short intervals', 'Sleep, fuel, deload weeks'] },
];

// ── Blindspot analyzer. Reads the skill tree + recent sessions +
//    readiness and returns the gaps an elite coach would call out.
const TIER_ORDER = { Foundation: 0, Developing: 1, Advanced: 2, Elite: 3 };

export function analyzeBlindspots(skills, sessions = [], readiness = null, disciplines = []) {
  const flags = [];
  const now = Date.now();
  const recent = (sessions || []).filter((s) => new Date(s.date || s.ts || 0).getTime() >= now - 21 * 864e5);
  const trained = new Set(recent.map((s) => s.discipline));
  const discList = disciplines.length ? disciplines : Object.keys(skills || {}).map((id) => ({ id, name: id }));

  // 1. No recent training at all.
  if (recent.length === 0) {
    flags.push({ sev: 'high', title: 'No sessions logged recently', detail: 'Nothing in the last 3 weeks — momentum and tissue resilience fade fast.', fix: 'Log even one session; consistency beats intensity for skill retention.' });
  }

  // 2. Neglected disciplines (have active work but untrained lately).
  for (const d of discList) {
    const list = (skills && skills[d.id]) || [];
    const hasWork = list.some((s) => s.status === 'active');
    if (hasWork && recent.length > 0 && !trained.has(d.id)) {
      flags.push({ sev: 'med', title: `Neglecting ${d.name}`, detail: `You have active skills in ${d.name} but haven't trained it in 3 weeks.`, fix: `Slot a short ${d.name} block in this week to keep the progression alive.` });
    }
  }

  // 3. Foundation gaps — building advanced skills on incomplete basics.
  for (const d of discList) {
    const list = (skills && skills[d.id]) || [];
    const foundationsDone = list.filter((s) => s.tier === 'Foundation').every((s) => s.status === 'done');
    const reachingHigh = list.some((s) => (s.status === 'active' || s.status === 'done') && TIER_ORDER[s.tier] >= 2);
    const foundationsExist = list.some((s) => s.tier === 'Foundation');
    if (foundationsExist && !foundationsDone && reachingHigh) {
      flags.push({ sev: 'high', title: `Shaky foundation in ${d.name}`, detail: `You're working advanced ${d.name} skills while Foundation-tier skills aren't locked in.`, fix: 'Re-earn the foundation — it removes the ceiling and the injury risk on the hard stuff.' });
    }
  }

  // 4. Training monotony — only one discipline recently.
  if (recent.length >= 4 && trained.size === 1) {
    const only = discList.find((d) => d.id === [...trained][0]);
    flags.push({ sev: 'med', title: 'Training monotony', detail: `Recent work is all ${only?.name || 'one discipline'} — overloads the same tissue and stalls all-around development.`, fix: 'Rotate stimulus: pair your main focus with a contrasting discipline or a mobility/strength day.' });
  }

  // 5. Readiness / recovery.
  if (readiness != null && readiness < 55) {
    flags.push({ sev: 'med', title: 'Under-recovered', detail: `Readiness is ${readiness}/100 — pushing max skills now risks injury and poor motor learning.`, fix: 'Make today technical and low-impact; prioritize sleep, fuel, and mobility.' });
  }

  // 6. Always-on coachable reminder: rotate a neglected foundation pillar.
  const foundationNudge = FOUNDATIONS[(Math.floor(now / 864e5)) % FOUNDATIONS.length];
  flags.push({ sev: 'low', title: `Don't skip: ${foundationNudge.name}`, detail: foundationNudge.why, fix: foundationNudge.drills.join(' · ') });

  return flags;
}

// Pull the drills for a discipline + tier (used by the skill tree + coach).
export function drillsFor(disciplineId, tier) {
  return (DRILLS[disciplineId] && DRILLS[disciplineId][tier]) || [];
}
