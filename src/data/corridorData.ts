export type DoorCategory = 'eco-lab' | 'admin-support';

export interface DoorSpec {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: DoorCategory;
  emblemType:
    | 'garden'
    | 'energy'
    | 'waste'
    | 'water'
    | 'compost'
    | 'principal'
    | 'secretariat-north'
    | 'secretariat-south'
    | 'wc'
    | 'storage';
  accentHex: string;
  secondaryHex: string;
  /** World coordinates of the door pivot on the floor (Y = 0) */
  position: [number, number, number];
  /** Rotation around Y in radians so the door's front (+Z in local space) faces into the corridor */
  rotationY: number;
  /** Ideal camera position when inspecting this door */
  cameraPos: [number, number, number];
  /** Ideal OrbitControls target when inspecting this door */
  cameraTarget: [number, number, number];
  /** Normalized coordinates (0-100%) on the 2D floorplan image for the interactive map */
  floorplanCoords: { x: number; y: number };
  description: string;
  activities: string[];
  metrics: { label: string; value: string }[];
}

export interface CameraPreset {
  id: string;
  label: string;
  shortLabel: string;
  position: [number, number, number];
  target: [number, number, number];
  description: string;
}

export const CORRIDOR_DOORS: DoorSpec[] = [
  // ============================================================================
  // 5 ΕΜΒΛΗΜΑΤΙΚΕΣ ΠΟΡΤΕΣ ΟΙΚΟΛΟΓΙΚΩΝ ΕΡΓΑΣΤΗΡΙΩΝ (ΔΥΤΙΚΟΣ ΤΟΙΧΟΣ - ΜΠΡΟΣΤΑ)
  // ============================================================================
  {
    id: 'lab-garden',
    number: 1,
    title: 'Φροντίδα Σχολικού Κήπου',
    subtitle: 'Εργαστήριο Βιοποικιλότητας & Βοτανικής',
    category: 'eco-lab',
    emblemType: 'garden',
    accentHex: '#10b981',
    secondaryHex: '#059669',
    position: [-4.5, 0, -15.2],
    rotationY: Math.PI / 2,
    cameraPos: [1.4, 1.75, -15.2],
    cameraTarget: [-4.5, 1.85, -15.2],
    floorplanCoords: { x: 35, y: 20 },
    description:
      'Εμβληματικό εργαστήριο αφιερωμένο στην καλλιέργεια ενδημικών φυτών, αρωματικών βοτάνων και λαχανικών στον σχολικό κήπο, με κυκλικούς πάγκους ομαδικής εργασίας.',
    activities: [
      'Σχεδιασμός παρτεριών αρωματικών φυτών και μελισσοκομικής χλωρίδας',
      'Αυτοματοποιημένος έλεγχος υγρασίας εδάφους με αισθητήρες',
      'Τράπεζα παραδοσιακών σπόρων και ημερολόγιο σποράς',
    ],
    metrics: [
      { label: 'Φυτικά Είδη', value: '48 Είδη' },
      { label: 'Ομάδες Εργασίας', value: '4 Κυκλικά Τραπέζια' },
      { label: 'Πράσινη Κάλυψη', value: '+35% Έκταση' },
    ],
  },
  {
    id: 'lab-energy',
    number: 2,
    title: 'Μείωση Ενέργειας',
    subtitle: 'Εργαστήριο Ενεργειακής Απόδοσης & ΑΠΕ',
    category: 'eco-lab',
    emblemType: 'energy',
    accentHex: '#f59e0b',
    secondaryHex: '#d97706',
    position: [-4.5, 0, -7.6],
    rotationY: Math.PI / 2,
    cameraPos: [1.4, 1.75, -7.6],
    cameraTarget: [-4.5, 1.85, -7.6],
    floorplanCoords: { x: 35, y: 38 },
    description:
      'Εργαστήριο παρακολούθησης της ενεργειακής κατανάλωσης του σχολικού κτιρίου, πειραμάτων φωτοβολταϊκών στοιχείων και έξυπνου φωτισμού LED.',
    activities: [
      'Καταγραφή κατανάλωσης kWh ανά αίθουσα σε πραγματικό χρόνο',
      'Πειράματα ηλιακών συλλεκτών και ανεμογεννητριών κλίμακας',
      'Επιθεώρηση θερμομόνωσης κουφωμάτων με θερμοκάμερα',
    ],
    metrics: [
      { label: 'Εξοικονόμηση', value: '-28% kWh' },
      { label: 'Φωτισμός LED', value: '100% Κάλυψη' },
      { label: 'Φωτοβολταϊκά', value: '12.4 kWp' },
    ],
  },
  {
    id: 'lab-waste',
    number: 3,
    title: 'Χωρισμός Απορριμμάτων',
    subtitle: 'Εργαστήριο Ανακύκλωσης & Κυκλικής Οικονομίας',
    category: 'eco-lab',
    emblemType: 'waste',
    accentHex: '#f97316',
    secondaryHex: '#ea580c',
    position: [-4.5, 0, 0.0],
    rotationY: Math.PI / 2,
    cameraPos: [1.4, 1.75, 0.0],
    cameraTarget: [-4.5, 1.85, 0.0],
    floorplanCoords: { x: 35, y: 54 },
    description:
      'Κεντρικό εργαστήριο διαλογής στην πηγή (χαρτί, πλαστικό, αλουμίνιο, γυαλί, ηλεκτρονικά απόβλητα) και επαναχρησιμοποίησης υλικών μέσω δημιουργικών κατασκευών.',
    activities: [
      'Διαλογή 5 ρευμάτων ανακυκλώσιμων υλικών με ζύγιση',
      'Εργαστήριο Upcycling: μετατροπή πλαστικών καπακιών σε χρηστικά αντικείμενα',
      'Καμπάνια μηδενικών απορριμμάτων μιας χρήσης στο κυλικείο',
    ],
    metrics: [
      { label: 'Ρεύματα Διαλογής', value: '5 Κατηγορίες' },
      { label: 'Ανακύκλωση', value: '84% Ποσοστό' },
      { label: 'Μείωση Όγκου', value: '-420 kg/μήνα' },
    ],
  },
  {
    id: 'lab-water',
    number: 4,
    title: 'Εξοικονόμηση Νερού',
    subtitle: 'Εργαστήριο Υδάτινων Πόρων & Συλλογής Ομβρίων',
    category: 'eco-lab',
    emblemType: 'water',
    accentHex: '#06b6d4',
    secondaryHex: '#0284c7',
    position: [-4.5, 0, 7.6],
    rotationY: Math.PI / 2,
    cameraPos: [1.4, 1.75, 7.6],
    cameraTarget: [-4.5, 1.85, 7.6],
    floorplanCoords: { x: 35, y: 70 },
    description:
      'Εργαστήριο διαχείρισης νερού, συστημάτων στάγδην άρδευσης, συλλογής βρόχινου νερού από την οροφή του σχολείου και ελέγχου ποιότητας νερού.',
    activities: [
      'Μοντέλο συλλογής και φίλτρανσης ομβρίων υδάτων για τον σχολικό κήπο',
      'Εγκατάσταση φίλτρων περιορισμού ροής στις βρύσες των WC',
      'Εντοπισμός κρυφών διαρροών στο υδραυλικό δίκτυο',
    ],
    metrics: [
      { label: 'Μείωση Κατανάλωσης', value: '-34% m³' },
      { label: 'Δεξαμενή Ομβρίων', value: '2.500 L' },
      { label: 'Στάγδην Άρδευση', value: '100% Κήπου' },
    ],
  },
  {
    id: 'lab-compost',
    number: 5,
    title: 'Οργάνωση Κομποστοποίησης',
    subtitle: 'Εργαστήριο Οργανικής Ανακύκλωσης & Εδαφολογίας',
    category: 'eco-lab',
    emblemType: 'compost',
    accentHex: '#84cc16',
    secondaryHex: '#ca8a04',
    position: [-4.5, 0, 15.2],
    rotationY: Math.PI / 2,
    cameraPos: [1.4, 1.75, 15.2],
    cameraTarget: [-4.5, 1.85, 15.2],
    floorplanCoords: { x: 35, y: 88 },
    description:
      'Εργαστήριο μετατροπής οργανικών υπολειμμάτων και φύλλων σε πλούσιο εδαφοβελτιωτικό χούμο (compost) για τον εμπλουτισμό του σχολικού κήπου.',
    activities: [
      'Παρακολούθηση θερμοκρασίας, C/N αναλογίας και αερισμού στους κάδους κομπόστ',
      'Βερμικομποστοποίηση με γαιοσκώληκες σε ειδικούς θαλάμους',
      'Διάθεση ώριμου κομπόστ στα παρτέρια του Εργαστηρίου Κήπου',
    ],
    metrics: [
      { label: 'Παραγωγή Κομπόστ', value: '180 kg/μήνα' },
      { label: 'Θερμοκρασία Πυρήνα', value: '58 °C' },
      { label: 'Οργανική Εκτροπή', value: '92%' },
    ],
  },

  // ============================================================================
  // 5 ΠΛΑΪΝΕΣ ΠΟΡΤΕΣ ΔΙΟΙΚΗΣΗΣ & ΥΠΟΣΤΗΡΙΞΗΣ (ΣΥΜΦΩΝΑ ΜΕ ΤΗΝ ΚΑΤΟΨΗ)
  // ============================================================================
  {
    id: 'room-principal',
    number: 6,
    title: 'Γραφείο Διευθυντή',
    subtitle: 'Διεύθυνση Σχολικής Μονάδας & Συντονισμός',
    category: 'admin-support',
    emblemType: 'principal',
    accentHex: '#38bdf8',
    secondaryHex: '#0284c7',
    // Matches the distinctive angled 45-degree wall in the upper-right of the central corridor!
    position: [1.65, 0, -4.65],
    rotationY: -Math.PI * 0.75,
    cameraPos: [-1.8, 1.75, -1.2],
    cameraTarget: [1.65, 1.65, -4.65],
    floorplanCoords: { x: 72, y: 38 },
    description:
      'Το Γραφείο Διευθυντή με τη χαρακτηριστική γωνιακή είσοδο 45° προς τον κεντρικό διάδρομο, όπως αποτυπώνεται στην κάτοψη του ισογείου.',
    activities: [
      'Συντονισμός των 5 Οικολογικών Εργαστηρίων και της Σχολικής Επιτροπής',
      'Υποδοχή εκπαιδευτικών, γονέων και μαθητικών συμβουλίων',
      'Κεντρικός έλεγχος του ψηφιακού χρονομέτρου δράσεων',
    ],
    metrics: [
      { label: 'Θέση Κάτοψης', value: 'Ανατολική Πτέρυγα' },
      { label: 'Διάταξη Εισόδου', value: 'Γωνιακή 45°' },
      { label: 'Κατάσταση', value: 'Ανοικτό' },
    ],
  },
  {
    id: 'room-secretariat-north',
    number: 7,
    title: 'Γραμματεία (Βόρεια)',
    subtitle: 'Διοικητική Υποστήριξη & Αρχείο Μαθητών',
    category: 'admin-support',
    emblemType: 'secretariat-north',
    accentHex: '#818cf8',
    secondaryHex: '#4f46e5',
    position: [-1.8, 0, -21.8],
    rotationY: 0,
    cameraPos: [-1.8, 1.75, -16.2],
    cameraTarget: [-1.8, 1.65, -21.8],
    floorplanCoords: { x: 57, y: 21 },
    description:
      'Η Βόρεια Γραμματεία στο άνω άκρο του κεντρικού διαδρόμου, εξοπλισμένη με τέσσερις θέσεις εργασίας και θυρίδα εξυπηρέτησης μαθητών.',
    activities: [
      'Πρωτόκολλο εισερχομένων/εξερχομένων εγγράφων και βεβαιώσεων',
      'Διαχείριση παρουσιολογίων και προγράμματος εργαστηρίων',
      'Υποστήριξη σχολικών εκδηλώσεων και οικολογικών δράσεων',
    ],
    metrics: [
      { label: 'Θέση Κάτοψης', value: 'Βόρεια Απόληξη' },
      { label: 'Γραφεία', value: '4 Θέσεις Εργασίας' },
      { label: 'Ωράριο', value: '08:00 - 15:30' },
    ],
  },
  {
    id: 'room-wc-north',
    number: 8,
    title: 'WC',
    subtitle: 'Χώροι Υγιεινής & Πρόσβασης ΑμεΑ',
    category: 'admin-support',
    emblemType: 'wc',
    accentHex: '#2dd4bf',
    secondaryHex: '#0d9488',
    position: [2.1, 0, -21.8],
    rotationY: 0,
    cameraPos: [2.1, 1.75, -16.2],
    cameraTarget: [2.1, 1.65, -21.8],
    floorplanCoords: { x: 72, y: 21 },
    description:
      'Σύγχρονοι χώροι υγιεινής εξοπλισμένοι με βρύσες φωτοκυττάρου χαμηλής ροής και συστήματα εξοικονόμησης νερού σε σύνδεση με το Εργαστήριο Νερού.',
    activities: [
      'Αισθητήρες αυτόματης διακοπής ροής στις νιπτήρες',
      'Χρήση οικολογικών βιοδιασπώμενων αναλωσίμων',
      'Πλήρης προσβασιμότητα και σήμανση',
    ],
    metrics: [
      { label: 'Θέση Κάτοψης', value: 'ΒΑ & ΝΑ Πτέρυγα' },
      { label: 'Βρύσες Eco', value: 'Φωτοκύτταρο' },
      { label: 'Εξοικονόμηση', value: '1.8 L/λεπτό' },
    ],
  },
  {
    id: 'room-storage',
    number: 9,
    title: 'Αποθήκη',
    subtitle: 'Αποθήκη Εξοπλισμού & Εργαλείων Εργαστηρίων',
    category: 'admin-support',
    emblemType: 'storage',
    accentHex: '#fbbf24',
    secondaryHex: '#b45309',
    position: [4.5, 0, -14.2],
    rotationY: -Math.PI / 2,
    cameraPos: [-0.8, 1.75, -14.2],
    cameraTarget: [4.5, 1.65, -14.2],
    floorplanCoords: { x: 88, y: 24 },
    description:
      'Συγκρότημα αποθηκών στην ανατολική πλευρά της κάτοψης για τη φύλαξη εργαλείων κηπουρικής, κάδων διαλογής, οργάνων μέτρησης ενέργειας και αναλωσίμων.',
    activities: [
      'Ταξινόμηση εργαλείων κήπου, ποτιστηριών και γαντιών εργασίας',
      'Αποθήκευση ανταλλακτικών LED και οργάνων εργαστηρίων',
      'Φύλαξη σάκων ώριμου κομπόστ και ανακυκλώσιμων υλικών',
    ],
    metrics: [
      { label: 'Θέση Κάτοψης', value: 'Ανατολική Πτέρυγα' },
      { label: 'Χώροι', value: '6 Τμήματα Αποθήκης' },
      { label: 'Εξοπλισμός', value: '140+ Εργαλεία' },
    ],
  },
  {
    id: 'room-secretariat-south',
    number: 10,
    title: 'Γραμματεία (Νότια)',
    subtitle: 'Γραμματεία Μαθητικών Κοινοτήτων & WC Νότιας Πτέρυγας',
    category: 'admin-support',
    emblemType: 'secretariat-south',
    accentHex: '#a78bfa',
    secondaryHex: '#7c3aed',
    position: [-1.8, 0, 21.8],
    rotationY: Math.PI,
    cameraPos: [-1.8, 1.75, 16.2],
    cameraTarget: [-1.8, 1.65, 21.8],
    floorplanCoords: { x: 57, y: 86 },
    description:
      'Η Νότια Γραμματεία στο κάτω άκρο του κεντρικού διαδρόμου, δίπλα στο Εργαστήριο Κομποστοποίησης και το νότιο συγκρότημα WC & Αποθηκών.',
    activities: [
      'Συντονισμός μαθητικών ομάδων περιβαλλοντικής εκπαίδευσης',
      'Έκδοση πιστοποιητικών συμμετοχής στις οικολογικές δράσεις',
      'Διαχείριση υλικού πινάκων ανακοινώσεων διαδρόμου',
    ],
    metrics: [
      { label: 'Θέση Κάτοψης', value: 'Νότια Απόληξη' },
      { label: 'Γραφεία', value: '4 Θέσεις Εργασίας' },
      { label: 'Διασύνδεση', value: 'WC & Αποθήκες Νότου' },
    ],
  },
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'panoramic-center',
    label: 'Κεντρική Πανοραμική 360° (5 Εμβληματικές Πόρτες)',
    shortLabel: 'Κέντρο 360°',
    position: [3.2, 2.05, 0.0],
    target: [-4.5, 2.15, 0.0],
    description: 'Θέαση των 5 εμβληματικών πορτών και του κεντρικού ψηφιακού χρονομέτρου με πλήρη περιστροφή 360°',
  },
  {
    id: 'north-wing',
    label: 'Βόρεια Πτέρυγα (Κήπος, Ενέργεια, Γραμματεία, WC)',
    shortLabel: 'Βόρεια Πτέρυγα',
    position: [2.2, 2.0, -11.5],
    target: [-3.2, 1.95, -14.5],
    description: 'Άποψη της βόρειας πλευράς με τα εργαστήρια Κήπου & Ενέργειας, τη Βόρεια Γραμματεία και τα WC',
  },
  {
    id: 'south-wing',
    label: 'Νότια Πτέρυγα (Νερό, Κομποστοποίηση, Σκάλες)',
    shortLabel: 'Νότια Πτέρυγα',
    position: [2.2, 2.0, 11.5],
    target: [-3.2, 1.95, 14.5],
    description: 'Άποψη της νότιας πλευράς με τα εργαστήρια Νερού & Κομποστοποίησης, τις Σκάλες και τη Νότια Γραμματεία',
  },
  {
    id: 'chronometer-focus',
    label: 'Εστίαση στο Ψηφιακό Χρονόμετρο',
    shortLabel: 'Χρονόμετρο',
    position: [2.5, 2.4, 0.0],
    target: [-3.8, 3.85, 0.0],
    description: 'Κοντινή εστίαση στο μεγάλο ψηφιακό χρονόμετρο αντίστροφης μέτρησης πάνω από τις εμβληματικές πόρτες',
  },
  {
    id: 'principal-wing',
    label: 'Γραφείο Διευθυντή & Ανατολική Πτέρυγα',
    shortLabel: 'Γραφ. Διευθυντή',
    position: [-2.4, 1.85, -1.5],
    target: [2.0, 1.75, -5.0],
    description: 'Θέαση της χαρακτηριστικής γωνιακής εισόδου του Γραφείου Διευθυντή, των ντουλαπιών και των αποθηκών',
  },
  {
    id: 'corridor-sweep',
    label: 'Διαμήκης Άποψη Κεντρικού Διαδρόμου',
    shortLabel: 'Διαμήκης Άποψη',
    position: [0.6, 2.35, 19.2],
    target: [-0.8, 1.9, -18.0],
    description: 'Πανοραμική διαμήκης άποψη ολόκληρου του φαρδιού σχολικού διαδρόμου από νότο προς βορρά',
  },
];
