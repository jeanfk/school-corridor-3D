import React from 'react';
import { X, Compass, DoorOpen } from 'lucide-react';
import { CORRIDOR_DOORS, DoorSpec } from '../data/corridorData';

interface FloorplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoorId: string | null;
  onSelectDoor: (door: DoorSpec) => void;
}

export const FloorplanModal: React.FC<FloorplanModalProps> = ({
  isOpen,
  onClose,
  selectedDoorId,
  onSelectDoor,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="floorplan-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2
              id="floorplan-modal-title"
              className="font-display text-lg font-bold text-slate-100"
            >
              Κάτοψη Ισογείου Σχολείου — Διαδραστικός Χάρτης 10 Πορτών
            </h2>
            <p className="text-xs text-slate-400">
              Επιλέξτε οποιαδήποτε αίθουσα ή πόρτα στην κάτοψη για άμεση μετάβαση της κάμερας στον 3D διάδρομο
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label="Κλείσιμο κάτοψης"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body: 2-Column Split (Interactive Blueprint Image + 10 Doors Directory) */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-12">
          {/* Left: Uploaded Floorplan Image with Interactive Hotspots */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-white p-3 lg:col-span-7">
            <div className="relative inline-block max-h-[68vh]">
              <img
                src="/assets/aistudio/Classroom-Floor-Model_5_LABS_4f3e4ca3.jpg"
                alt="Κάτοψη Ισογείου Σχολείου με τα 5 Εργαστήρια και τον Κεντρικό Διάδρομο"
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto rounded-lg object-contain"
              />

              {/* Interactive Pins on the Blueprint */}
              {CORRIDOR_DOORS.map((door) => {
                const isSelected = selectedDoorId === door.id;
                return (
                  <button
                    key={door.id}
                    onClick={() => {
                      onSelectDoor(door);
                      onClose();
                    }}
                    style={{
                      left: `${door.floorplanCoords.x}%`,
                      top: `${door.floorplanCoords.y}%`,
                      backgroundColor: isSelected ? '#0f172a' : door.accentHex,
                      borderColor: isSelected ? door.accentHex : '#ffffff',
                    }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold text-slate-950 shadow-lg transition-transform hover:scale-110 focus:outline-none"
                    title={`${door.number}. ${door.title}`}
                  >
                    <span className={isSelected ? 'text-white font-mono-tabular' : 'text-slate-950 font-mono-tabular'}>
                      {door.number}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Complete Directory of the 10 Doors */}
          <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-semibold text-emerald-400">
                  5 Εμβληματικές Πόρτες Εργαστηρίων (Δυτική Πτέρυγα)
                </h3>
                <div className="mt-2 space-y-2">
                  {CORRIDOR_DOORS.filter((d) => d.category === 'eco-lab').map((door) => (
                    <button
                      key={door.id}
                      onClick={() => {
                        onSelectDoor(door);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                        selectedDoorId === door.id
                          ? 'border-emerald-500 bg-slate-800 text-white'
                          : 'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-slate-950 font-mono-tabular"
                          style={{ backgroundColor: door.accentHex }}
                        >
                          0{door.number}
                        </span>
                        <div className="truncate">
                          <div className="truncate text-sm font-semibold text-white">
                            “{door.title}”
                          </div>
                          <div className="truncate text-xs text-slate-400">{door.subtitle}</div>
                        </div>
                      </div>
                      <DoorOpen className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-sm font-semibold text-sky-400">
                  5 Πλαϊνές Πόρτες Διοίκησης & Υποστήριξης
                </h3>
                <div className="mt-2 space-y-2">
                  {CORRIDOR_DOORS.filter((d) => d.category === 'admin-support').map((door) => (
                    <button
                      key={door.id}
                      onClick={() => {
                        onSelectDoor(door);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2 text-left transition-colors ${
                        selectedDoorId === door.id
                          ? 'border-sky-500 bg-slate-800 text-white'
                          : 'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-slate-950 font-mono-tabular"
                          style={{ backgroundColor: door.accentHex }}
                        >
                          {door.number}
                        </span>
                        <div className="truncate">
                          <div className="truncate text-sm font-semibold text-white">
                            “{door.title}”
                          </div>
                          <div className="truncate text-xs text-slate-400">{door.subtitle}</div>
                        </div>
                      </div>
                      <Compass className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-400">
              Στον κεντρικό διάδρομο περιλαμβάνονται επίσης το κεντρικό ψηφιακό χρονόμετρο αντίστροφης μέτρησης, 5 πίνακες ανακοινώσεων, 4 συστοιχίες μαθητικών ντουλαπιών, κάδοι διαλογής και οι σκάλες για τους επάνω ορόφους.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
