/**
 * i18n dictionaries. Full parity between EN and AR.
 * Add a key here and it'll be available via `t("key")` everywhere.
 */

export type Locale = "en" | "ar";

export const LOCALES: { code: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية",  dir: "rtl" },
];

type Dict = Record<string, string>;

export const EN: Dict = {
  // meta / brand
  "brand.name": "Football Mystery Pack",
  "brand.tagline": "Hidden squads. Real legends.",
  "brand.beta": "Beta",

  // home
  "home.badge": "AI-powered duel",
  "home.title.1": "Hidden squads.",
  "home.title.2": "Real legends.",
  "home.subtitle":
    "Two players. Six mystery packs. Ask the AI referee sharp yes-or-no questions, deduce which squad hides greatness, then let the AI analyst simulate the match.",
  "home.cta.start": "Start match",
  "home.cta.how": "How it works",
  "home.stat.players": "footballers",
  "home.stat.packs": "mystery packs",
  "home.stat.possibilities": "possibilities",
  "home.step.1.t": "Draw packs",
  "home.step.1.d": "Each player receives 3 hidden squads of 11 footballers.",
  "home.step.2.t": "Ask the referee",
  "home.step.2.d": "AI answers based on attributes — never names names.",
  "home.step.3.t": "Lock a pack",
  "home.step.3.d": "Pick the strongest squad from your three.",
  "home.step.4.t": "Simulate",
  "home.step.4.d": "AI analyst calls the winner, MVP and final score.",
  "home.footer": "Built for football deduction. Powered by AI.",

  // game shell
  "game.restart": "Restart",

  // intro
  "intro.title": "New match",
  "intro.hint": "Two players share one device. You'll take turns asking — packs stay hidden until both lock in.",
  "intro.p1": "Player 1",
  "intro.p2": "Player 2",
  "intro.placeholder.1": "e.g. Alex",
  "intro.placeholder.2": "e.g. Sam",
  "intro.cta": "Deal the packs",

  // pass
  "pass.header": "Pass the device",
  "pass.body":
    "Others in the room: look away. The screen is about to reveal information only for {name}.",
  "pass.cta": "I'm {name} — continue",

  // question
  "q.round": "Round {n} · Question phase",
  "q.turn": "{asker}, ask about {opp}'s pack",
  "q.end": "End questioning →",
  "q.targetPack": "Target pack",
  "q.of": "of {name}",
  "q.ask": "Ask the AI referee",
  "q.placeholder": "Does the pack contain a World Cup winner?",
  "q.send": "Ask",
  "q.sending": "Thinking…",
  "q.log": "Referee log",
  "q.logEmpty": "No questions yet. Ask the first.",
  "q.error": "The referee couldn't answer. Try again.",

  // suggested
  "sug.1": "Does this pack contain a Ballon d'Or winner?",
  "sug.2": "Does this pack contain a World Cup winner?",
  "sug.3": "Does the pack include a Barcelona player?",
  "sug.4": "Does this pack contain a Brazilian?",
  "sug.5": "Does this pack contain a Champions League winner?",
  "sug.6": "Is the average rating above 85?",
  "sug.7": "Does this pack include a retired player?",
  "sug.8": "Is there a left-footed player?",
  "sug.9": "Does anyone play in the Premier League?",
  "sug.10": "Is there an African player?",
  "sug.11": "Is the pack captain a defender?",
  "sug.12": "Does anyone have over 100 international caps?",

  // choose
  "choose.header": "Choose your fighter",
  "choose.title": "{name}, lock in one pack",
  "choose.subtitle": "Once you both lock, the squads are revealed and the match is simulated.",
  "choose.hidden": "Packs stay hidden — no peeking. Pick with your deductions.",
  "choose.cta": "Lock choice",

  // reveal
  "reveal.header": "Squads revealed",
  "reveal.vs": "{a} vs {b}",
  "reveal.sim": "Kick off the match",
  "reveal.simming": "Simulating…",
  "reveal.rating": "Team rating",
  "reveal.error": "The analyst is offline. Try again.",

  // result
  "result.ft": "Full time",
  "result.winner": "Winner:",
  "result.mvp": "Match MVP",
  "result.summary": "Summary",
  "result.tactics": "Tactics",
  "result.win": "{name} win",
  "result.draw": "Draw",
  "result.new": "New match",
  "result.home": "Home",

  // player card fields
  "pc.pos.GK": "Goalkeeper",
  "pc.pos.DEF": "Defender",
  "pc.pos.MID": "Midfielder",
  "pc.pos.FWD": "Forward",
  "pc.badge.bd": "Ballon d'Or",
  "pc.badge.wc": "World Cup",
  "pc.badge.ucl": "UCL",
  "pc.badge.leg": "Legend",
  "pc.badge.cap": "Captain",

  // pack card
  "pack.mystery": "Mystery",
  "pack.squad": "Squad",
  "pack.hidden11": "11 players hidden",

  // language
  "lang.label": "Language",
};

export const AR: Dict = {
  "brand.name": "باقة كرة القدم الغامضة",
  "brand.tagline": "فرق مخفية. أساطير حقيقية.",
  "brand.beta": "تجريبي",

  "home.badge": "مبارزة بذكاء اصطناعي",
  "home.title.1": "فرق مخفية.",
  "home.title.2": "أساطير حقيقية.",
  "home.subtitle":
    "لاعبان. ست باقات غامضة. اطرح على الحكم الذكي أسئلة حاسمة بنعم أو لا، استنتج أي فريق يخفي العظمة، ثم دع المحلل الذكي يحاكي المباراة.",
  "home.cta.start": "ابدأ المباراة",
  "home.cta.how": "كيف تعمل",
  "home.stat.players": "لاعبون",
  "home.stat.packs": "باقات غامضة",
  "home.stat.possibilities": "احتمالات",
  "home.step.1.t": "اسحب الباقات",
  "home.step.1.d": "كل لاعب يحصل على ٣ فرق مخفية من ١١ لاعباً.",
  "home.step.2.t": "اسأل الحكم",
  "home.step.2.d": "الذكاء الاصطناعي يجيب بناءً على الصفات — دون ذكر أسماء.",
  "home.step.3.t": "ثبّت باقتك",
  "home.step.3.d": "اختر أقوى فريق من بين الثلاثة.",
  "home.step.4.t": "المحاكاة",
  "home.step.4.d": "المحلل الذكي يعلن الفائز وأفضل لاعب والنتيجة النهائية.",
  "home.footer": "صُممت لعشاق الاستنتاج الكروي. مدعومة بالذكاء الاصطناعي.",

  "game.restart": "إعادة",

  "intro.title": "مباراة جديدة",
  "intro.hint": "لاعبان يتشاركان جهازاً واحداً. تتناوبان في طرح الأسئلة — الباقات تبقى مخفية حتى تختارا معاً.",
  "intro.p1": "اللاعب الأول",
  "intro.p2": "اللاعب الثاني",
  "intro.placeholder.1": "مثال: أحمد",
  "intro.placeholder.2": "مثال: خالد",
  "intro.cta": "وزّع الباقات",

  "pass.header": "مرّر الجهاز",
  "pass.body": "من في الغرفة: انظروا بعيداً. الشاشة على وشك عرض معلومات لـ {name} فقط.",
  "pass.cta": "أنا {name} — متابعة",

  "q.round": "الجولة {n} · مرحلة الأسئلة",
  "q.turn": "{asker}، اسأل عن باقة {opp}",
  "q.end": "إنهاء الأسئلة ←",
  "q.targetPack": "الباقة المستهدفة",
  "q.of": "لـ {name}",
  "q.ask": "اسأل الحكم الذكي",
  "q.placeholder": "هل تحتوي الباقة على فائز بكأس العالم؟",
  "q.send": "اسأل",
  "q.sending": "يفكر…",
  "q.log": "سجل الحكم",
  "q.logEmpty": "لا أسئلة بعد. ابدأ بأول سؤال.",
  "q.error": "لم يستطع الحكم الإجابة. حاول مرة أخرى.",

  "sug.1": "هل تحتوي الباقة على فائز بالكرة الذهبية؟",
  "sug.2": "هل تحتوي الباقة على فائز بكأس العالم؟",
  "sug.3": "هل تضم الباقة لاعباً من برشلونة؟",
  "sug.4": "هل تحتوي الباقة على لاعب برازيلي؟",
  "sug.5": "هل تحتوي الباقة على فائز بدوري الأبطال؟",
  "sug.6": "هل متوسط التقييم أعلى من ٨٥؟",
  "sug.7": "هل تضم الباقة لاعباً معتزلاً؟",
  "sug.8": "هل هناك لاعب أيسر؟",
  "sug.9": "هل يلعب أحدهم في الدوري الإنجليزي؟",
  "sug.10": "هل هناك لاعب أفريقي؟",
  "sug.11": "هل قائد الفريق مدافع؟",
  "sug.12": "هل هناك لاعب لديه أكثر من ١٠٠ مباراة دولية؟",

  "choose.header": "اختر مقاتلك",
  "choose.title": "{name}، اختر باقة واحدة",
  "choose.subtitle": "بعد أن تختارا كلاكما، تُكشف الفرق وتُحاكى المباراة.",
  "choose.hidden": "الباقات مخفية — لا تختلس النظر. اختر بناءً على استنتاجاتك.",
  "choose.cta": "تثبيت الاختيار",

  "reveal.header": "كُشفت الفرق",
  "reveal.vs": "{a} ضد {b}",
  "reveal.sim": "بدء المباراة",
  "reveal.simming": "يحاكي…",
  "reveal.rating": "تقييم الفريق",
  "reveal.error": "المحلل غير متصل. حاول مجدداً.",

  "result.ft": "نهاية المباراة",
  "result.winner": "الفائز:",
  "result.mvp": "أفضل لاعب",
  "result.summary": "الملخص",
  "result.tactics": "التكتيكات",
  "result.win": "فوز {name}",
  "result.draw": "تعادل",
  "result.new": "مباراة جديدة",
  "result.home": "الرئيسية",

  "pc.pos.GK": "حارس مرمى",
  "pc.pos.DEF": "مدافع",
  "pc.pos.MID": "لاعب وسط",
  "pc.pos.FWD": "مهاجم",
  "pc.badge.bd": "الكرة الذهبية",
  "pc.badge.wc": "كأس العالم",
  "pc.badge.ucl": "دوري الأبطال",
  "pc.badge.leg": "أسطورة",
  "pc.badge.cap": "قائد",

  "pack.mystery": "غامضة",
  "pack.squad": "باقة",
  "pack.hidden11": "١١ لاعباً مخفياً",

  "lang.label": "اللغة",
};

export const DICTS: Record<Locale, Dict> = { en: EN, ar: AR };
