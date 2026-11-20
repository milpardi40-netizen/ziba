/**
 * Bilingual engine (English / Arabic).
 *
 * Two layers:
 *  1. UI strings — every hardcoded label in the components, translated
 *     here and resolved with `ui(lang, key)`.
 *  2. Content overlay — CMS prose lives in `config` (the admin's primary
 *     language). Arabic content is an overlay of translated strings:
 *     the shipped `DEFAULT_AR` (translations of the default content)
 *     plus anything the admin writes in the panel's Arabic editing
 *     mode, stored at `config.ar`. `applyOverlay` merges it over the
 *     base config, so components keep reading `config` unchanged.
 */

export type Lang = "en" | "ar";

export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** Merge an Arabic string overlay over a base value. */
export function applyOverlay<T>(base: T, overlay: unknown): T {
  if (overlay === undefined || overlay === null) return base;
  if (typeof overlay === "string") {
    return (overlay.trim() ? overlay : base) as T;
  }
  if (Array.isArray(overlay)) {
    if (!Array.isArray(base)) return overlay as T;
    // Id-aware merge: overlay entries carrying an `id` are matched to
    // the base entry with the same id (so translations survive the
    // admin reordering, adding or deleting list items); anything else
    // falls back to positional merging.
    const idOf = (v: unknown): string | undefined =>
      v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string"
        ? (v as { id: string }).id
        : undefined;
    const overlayById = new Map<string, unknown>();
    for (const item of overlay) {
      const id = idOf(item);
      if (id) overlayById.set(id, item);
    }
    const merged = base.map((item, i) => {
      const id = idOf(item);
      if (id && overlayById.has(id)) return applyOverlay(item, overlayById.get(id));
      return applyOverlay(item, overlay[i]);
    });
    // Overlay entries beyond the base list are ignored: structure
    // (add / delete / reorder) always comes from the base config, so a
    // stale translation can never resurrect a deleted item.
    return merged as T;
  }
  if (typeof overlay === "object") {
    if (typeof base !== "object" || base === null || Array.isArray(base)) {
      return overlay as T;
    }
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(overlay as Record<string, unknown>)) {
      out[key] = applyOverlay(
        (base as Record<string, unknown>)[key],
        (overlay as Record<string, unknown>)[key]
      );
    }
    return out as T;
  }
  return base;
}

/**
 * Diff a fully-edited config against its base and keep only the string
 * leaves that changed — this is what the Admin Panel stores when the
 * owner translates content in Arabic editing mode.
 */
export function extractStringOverlay(base: unknown, full: unknown): unknown {
  if (typeof full === "string" && typeof base === "string") {
    return full !== base ? full : undefined;
  }
  if (Array.isArray(full)) {
    if (!Array.isArray(base)) return full;
    const out = full.map((item, i) => extractStringOverlay(base[i], item));
    return out.some((v) => v !== undefined) ? out : undefined;
  }
  if (full && typeof full === "object") {
    if (!base || typeof base !== "object" || Array.isArray(base)) return full;
    const out: Record<string, unknown> = {};
    let any = false;
    for (const key of Object.keys(full as Record<string, unknown>)) {
      const v = extractStringOverlay(
        (base as Record<string, unknown>)[key],
        (full as Record<string, unknown>)[key]
      );
      if (v !== undefined) {
        out[key] = v;
        any = true;
      }
    }
    if (!any) return undefined;
    // Keep the item's id so the overlay can be matched by id (not just
    // position) when `applyOverlay` merges it back over the base.
    const id = (full as Record<string, unknown>).id;
    if (typeof id === "string") out.id = id;
    return out;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* UI strings                                                          */
/* ------------------------------------------------------------------ */

const STRINGS = {
  en: {
    heroFeatured: "Featured specimen",
    heroSpecimenFile: "Specimen file",
    viewSpecimen: "View specimen",
    openSpecimenFile: "Open specimen file",
    cabinetWord: "Cabinet",
    allWord: "All",
    specimensWord: "specimens",
    localitiesWord: "localities",
    enterCabinet: "Enter the cabinet",
    cabinetOwnPage: "The {name} cabinet has its own page",
    mohsWord: "Mohs",
    pcsWord: "pcs",
    sortName: "Name · A–Z",
    sortRarity: "Rarest first",
    sortHardest: "Hardest first",
    sortSoftest: "Softest first",
    photoBy: "Photo:",
    /* specimen modal */
    specimenFile: "Specimen file",
    guidedTourStop: "Guided tour · stop {index} of {total}",
    closeSpecimenFile: "Close specimen file",
    referencePhotograph: "Reference photograph",
    formula: "Formula",
    crystalSystem: "Crystal system",
    luster: "Luster",
    inArchiveSince: "In archive since",
    dimensions: "Dimensions",
    mohsHardness: "Mohs hardness",
    provenancePedigree: "Provenance & Pedigree",
    hardnessOnMohs: "Hardness on the Mohs scale",
    directInquiry: "Direct collector inquiry",
    leaveMessage: "Leave a message",
    hideMessageForm: "Hide message form",
    callWord: "Call",
    inquiryReceived: "Inquiry received for {name}. We will contact you personally!",
    yourNamePh: "Your name *",
    phonePh: "Phone / WhatsApp / Email *",
    messageAboutPh: "Message about {name} ({catalog})...",
    sendInquiry: "Send Inquiry",
    modalFormError: "Please enter your name and phone number or email.",
    curatorsNote: "Curator's note",
    saveSpecimen: "Save specimen",
    savedWord: "Saved",
    prevSpecimen: "Previous specimen",
    nextSpecimen: "Next specimen",
    nextStop: "Next stop",
    nextWord: "Next",
    /* category page */
    cabinetMasterwork: "Cabinet masterwork",
    curatedPrefix: "How this cabinet is ",
    curatedEm: "curated",
    deskLooksFor: "What the desk looks for",
    insideCabinet: "Inside the {name} cabinet",
    shownOf: "{shown} of {total} shown",
    savedOnly: "Saved only",
    showWholeCabinet: "Show the whole cabinet",
    continuePrefix: "Continue through the ",
    continueEm: "salon",
    browseCabinets: "Browse the cabinets",
    requestViewing: "Request a private viewing",
    exhibitionWord: "Exhibition",
    cabinetsWord: "The Cabinets",
    uvReactive: "UV-reactive",
    deskCabinet: "Curatorial desk · {name} cabinet",
    filterBy: "Filter by {name}",
    notFoundBadge: "Error 404 · Uncatalogued",
    searchWithin: "Search within {name}",
    backToExhibition: "Back to the exhibition",
    specimensInCabinet: "Specimens in cabinet",
    localitiesRepresented: "Localities represented",
    acquiredLabel: "Acquired",
    mohsRangeLabel: "Mohs hardness range",
    browseSpecimens: "Browse the specimens",
    localitiesInCabinet: "Localities in this cabinet",
    crystalSystemsPresent: "Crystal systems present",
    searchInsideCabinet: "Search inside {name} — species, locality, chemistry…",
    clearSearch: "Clear search",
    sortSpecimensAria: "Sort specimens",
    nothingMatches: "Nothing in this cabinet matches",
    savedEmptyCabinet:
      "You have not saved a specimen from this cabinet yet — tap the heart on a card to start a shortlist.",
    tryBroaderCabinet: "Try a broader term, or clear the search to see the whole cabinet.",
    previousCabinet: "Previous cabinet",
    nextCabinet: "Next cabinet",
    /* nav pages */
    speakCurator: "Speak with a curator",
    browseVaultFirst: "Browse the vault first",
    deskOn: "The desk on {label}",
    continueVisitPrefix: "Continue the ",
    continueVisitEm: "visit",
    preparingRoom: "Preparing the room…",
    onThisPage: "On this page",
    exploreSection: "Explore the section",
    frequentlyAsked: "Collector questions",
    otherDestinations: "Other destinations",
    backToHome: "Back to the exhibition",
    /* floating dock */
    dockCallDesk: "Call the desk",
    dockWhatsappDetail: "Live chat with the admin",
    dockEmail: "Email",
    dockMessageAdmin: "Message to admin",
    dockFormDetail: "Inquiry form · replies personally",
    dockContactAdmin: "Contact the admin / curatorial desk",
    dockChannels: "Contact channels",
    dockScrollTopTitle: "Back to the surface — scroll to top",
    dockScrollBottomTitle: "To the depths — scroll to bottom",
    dockReadingProgress: "Reading progress",
    dockAria: "Contact the site admin and page scroll shortcuts",
    dockEmailSubject: "{brand} — Collector inquiry",
    dockClose: "Close",
    dockContactShort: "Contact admin",
    dockDeskReply: "Curatorial desk · replies same day",
    dockAriaClose: "Close contact channels",
    dockAriaOpen: "Contact the site admin — call, WhatsApp, Telegram, email or inquiry form",
    dockScrollTopAria: "Scroll to the top of the page",
    dockScrollBottomAria: "Scroll to the bottom of the page",
    /* footer credits */
    photoCreditsTitle: "Photography & Sources",
    photoCreditsNote:
      "Specimen photography credits, licences and sources for the archive plates used across the salon.",
    /* 404 */
    notFoundOverline: "Archive · Missing plate",
    notFoundTitle: "This plate is not in the archive",
    notFoundText:
      "The page you are looking for has either been re-catalogued or never entered the collection. Return to the exhibition and browse the cabinets from the top.",
    notFoundCta: "Return to the exhibition",
    /* language */
    languageName: "العربية",
  },
  ar: {
    heroFeatured: "العينة المميزة",
    heroSpecimenFile: "ملف العينة",
    viewSpecimen: "عرض العينة",
    openSpecimenFile: "فتح ملف العينة",
    cabinetWord: "خزانة",
    allWord: "الكل",
    specimensWord: "عينات",
    localitiesWord: "مواقع",
    enterCabinet: "دخول الخزانة",
    cabinetOwnPage: "لخزانة {name} صفحتها الخاصة",
    mohsWord: "موس",
    pcsWord: "عينة",
    sortName: "الاسم · أ–ي",
    sortRarity: "الأندر أولاً",
    sortHardest: "الأصلب أولاً",
    sortSoftest: "الألين أولاً",
    photoBy: "الصورة:",
    specimenFile: "ملف العينة",
    guidedTourStop: "جولة موجَّهة · المحطة {index} من {total}",
    closeSpecimenFile: "إغلاق ملف العينة",
    referencePhotograph: "صورة مرجعية",
    formula: "الصيغة الكيميائية",
    crystalSystem: "النظام البلوري",
    luster: "البريق",
    inArchiveSince: "في الأرشيف منذ",
    dimensions: "الأبعاد",
    mohsHardness: "صلادة موس",
    provenancePedigree: "المصدر والنسب",
    hardnessOnMohs: "الصلادة على مقياس موس",
    directInquiry: "استفسار مباشر من الجامع",
    leaveMessage: "اترك رسالة",
    hideMessageForm: "إخفاء نموذج الرسالة",
    callWord: "اتصال",
    inquiryReceived: "تم استلام استفسارك عن {name}. سنتواصل معك شخصياً!",
    yourNamePh: "اسمك *",
    phonePh: "الهاتف / واتساب / البريد الإلكتروني *",
    messageAboutPh: "رسالة حول {name} ({catalog})...",
    sendInquiry: "إرسال الاستفسار",
    modalFormError: "يرجى إدخال اسمك ورقم هاتفك أو بريدك الإلكتروني.",
    curatorsNote: "ملاحظة القيّم",
    saveSpecimen: "حفظ العينة",
    savedWord: "محفوظة",
    prevSpecimen: "العينة السابقة",
    nextSpecimen: "العينة التالية",
    nextStop: "المحطة التالية",
    nextWord: "التالي",
    cabinetMasterwork: "تحفة الخزانة",
    curatedPrefix: "كيف تُنتقى ",
    curatedEm: "هذه الخزانة",
    deskLooksFor: "ما يبحث عنه المكتب",
    insideCabinet: "داخل خزانة {name}",
    shownOf: "عرض {shown} من {total}",
    savedOnly: "المحفوظة فقط",
    showWholeCabinet: "عرض الخزانة كاملة",
    continuePrefix: "تابع التجول في ",
    continueEm: "الصالون",
    browseCabinets: "تصفح الخزائن",
    requestViewing: "اطلب مشاهدة خاصة",
    exhibitionWord: "المعرض",
    cabinetsWord: "الخزائن",
    uvReactive: "متفاعلة مع UV",
    deskCabinet: "مكتب القيّم · خزانة {name}",
    filterBy: "تصفية حسب {name}",
    notFoundBadge: "خطأ 404 · غير مفهرسة",
    searchWithin: "بحث داخل {name}",
    backToExhibition: "عودة إلى المعرض",
    specimensInCabinet: "عينات الخزانة",
    localitiesRepresented: "المواقع الممثَّلة",
    acquiredLabel: "سنوات الاقتناء",
    mohsRangeLabel: "نطاق صلادة موس",
    browseSpecimens: "تصفح العينات",
    localitiesInCabinet: "مواقع هذه الخزانة",
    crystalSystemsPresent: "الأنظمة البلورية الحاضرة",
    searchInsideCabinet: "ابحث داخل {name} — النوع، الموقع، الكيمياء…",
    clearSearch: "مسح البحث",
    sortSpecimensAria: "ترتيب العينات",
    nothingMatches: "لا شيء في هذه الخزانة يطابق بحثك",
    savedEmptyCabinet:
      "لم تحفظ بعد أي عينة من هذه الخزانة — اضغط القلب على أي بطاقة لبدء قائمتك الخاصة.",
    tryBroaderCabinet: "جرّب مصطلحاً أعم، أو امسح البحث لترى الخزانة كاملة.",
    previousCabinet: "الخزانة السابقة",
    nextCabinet: "الخزانة التالية",
    speakCurator: "تحدث مع قيّم",
    browseVaultFirst: "تصفح القبو أولاً",
    deskOn: "المكتب يتحدث عن {label}",
    continueVisitPrefix: "تابع ",
    continueVisitEm: "الزيارة",
    preparingRoom: "جارٍ تجهيز الغرفة…",
    onThisPage: "في هذه الصفحة",
    exploreSection: "استكشف القسم",
    frequentlyAsked: "أسئلة الجامعين",
    otherDestinations: "وجهات أخرى",
    backToHome: "عودة إلى المعرض",
    dockCallDesk: "اتصل بالمكتب",
    dockWhatsappDetail: "محادثة مباشرة مع الإدارة",
    dockEmail: "البريد الإلكتروني",
    dockMessageAdmin: "رسالة إلى الإدارة",
    dockFormDetail: "نموذج استفسار · رد شخصي",
    dockContactAdmin: "تواصل مع الإدارة / مكتب القيّم",
    dockChannels: "قنوات التواصل",
    dockScrollTopTitle: "عودة إلى السطح — مرّر إلى الأعلى",
    dockScrollBottomTitle: "إلى الأعماق — مرّر إلى الأسفل",
    dockReadingProgress: "تقدّم القراءة",
    dockAria: "التواصل مع إدارة الموقع واختصارات التمرير",
    dockEmailSubject: "{brand} — استفسار جامع",
    dockClose: "إغلاق",
    dockContactShort: "تواصل مع الإدارة",
    dockDeskReply: "مكتب القيّم · رد في اليوم نفسه",
    dockAriaClose: "إغلاق قنوات التواصل",
    dockAriaOpen: "تواصل مع إدارة الموقع — اتصال، واتساب، تيليجرام، بريد إلكتروني أو نموذج استفسار",
    dockScrollTopAria: "مرّر إلى أعلى الصفحة",
    dockScrollBottomAria: "مرّر إلى أسفل الصفحة",
    photoCreditsTitle: "التصوير والمصادر",
    photoCreditsNote:
      "اعتمادات تصوير العينات وتراخيصها ومصادرها للوحات الأرشيف المستخدمة في أرجاء الصالون.",
    notFoundOverline: "الأرشيف · لوحة مفقودة",
    notFoundTitle: "هذه اللوحة ليست في الأرشيف",
    notFoundText:
      "الصفحة التي تبحث عنها إما أُعيدت فهرستها أو لم تدخل المجموعة قط. عد إلى المعرض وتصفح الخزائن من البداية.",
    notFoundCta: "عودة إلى المعرض",
    languageName: "English",
  },
} as const;

export type UiKey = keyof (typeof STRINGS)["en"];

export function ui(
  lang: Lang,
  key: UiKey,
  vars?: Record<string, string | number>
): string {
  let text: string = STRINGS[lang][key] ?? STRINGS.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

/* Category display names — internal names stay English (they key the
   archive); only the displayed label is translated. */
export const CATEGORY_AR: Record<string, string> = {
  Gemstones: "الأحجار الكريمة",
  "Metals & Ores": "المعادن والخامات",
  Meteorites: "النيازك",
  Fluorescent: "الفلورية",
  "Classic Species": "الأنواع الكلاسيكية",
};

export function catLabel(name: string, lang: Lang): string {
  return lang === "ar" ? CATEGORY_AR[name] ?? name : name;
}
