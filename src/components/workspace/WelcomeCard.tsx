import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface ConceptPoint {
  label: string;
  text: string;
}

interface ConceptGroup {
  title: string;
  description?: string;
  points?: ConceptPoint[];
  stringGroups?: Array<{ strings: string; notes: string }>;
  inversions?: string[];
}

const welcomeContent = {
  title: "Welcome to Guitar Practice Tool",
  introduction: [
    "This tool is best suited for intermediate guitarists looking to move beyond basic chords and pentatonics, and develop a deeper understanding of harmony across the entire fretboard.",
    "The interactive fretboard below is the heart of the application. Use it to visualise triad and scale shapes in any key and track your practice over time.",
  ],
  sections: [
    {
      id: "key-concepts",
      title: "Key Concepts",
      groups: [
        {
          title: "Triads",
          points: [
            {
              label: "Simplified:",
              text: "Any chord can be played in 12 different triad shapes across the guitar fretboard.",
            },
            {
              label: "Three notes:",
              text: "A triad is built from the 1st, 3rd and 5th degrees of a scale.",
            },
            {
              label: "One shape:",
              text: "Each triad places three notes across three adjacent strings.",
            },
          ],
        },
        {
          title: "String Groups",
          description: "The six guitar strings divide into four adjacent three-string groups.",
          stringGroups: [
            { strings: "123", notes: "EAD" },
            { strings: "234", notes: "ADG" },
            { strings: "345", notes: "DGB" },
            { strings: "456", notes: "GBE" },
          ],
        },
        {
          title: "Inversions",
          description: "Every string group contains three inversions of each triad.",
          inversions: ["Root Position", "1st Inversion", "2nd Inversion"],
          points: [
            {
              label: "Listen and look:",
              text: "Pay attention to the inversion number and the lowest note, or bass note, of each shape. This makes the inversion names easier to understand.",
            },
          ],
        },
        {
          title: "Practice",
          description: "Harmony can feel deep and intimidating at first. Routine practice, deliberate repetition and active thinking gradually build understanding and confidence.",
          points: [
            {
              label: "Build coverage:",
              text: "Practise every inversion across every string group.",
            },
            {
              label: "Track repetitions:",
              text: "Use the counters beside each string group to record successful attempts.",
            },
            {
              label: "Review progress:",
              text: "Visit the Progress page for your overall practice summary.",
            },
          ],
        },
      ] as ConceptGroup[],
      closing: "Now get practising!",
    },
    {
      id: "what-is-harmony",
      title: "What is Harmony?",
      groups: [
        {
          title: "Sound in Context",
          description: "Harmony is the way notes sound and function together. It creates colour, tension and resolution around a musical idea.",
          points: [
            {
              label: "Melody:",
              text: "The line you can sing or hum, usually heard one note at a time.",
            },
            {
              label: "Harmony:",
              text: "The notes and chords that support that line and shape how it feels.",
            },
          ],
        },
        {
          title: "From Scale to Chords",
          description: "A major scale is more than a sequence of notes. Each scale degree can become the root of a chord using only notes from that key.",
          points: [
            {
              label: "A natural chord family:",
              text: "Building from each scale degree produces the harmonised major scale: seven related chords with their own roles and character.",
            },
            {
              label: "Shared material:",
              text: "Because the chords come from the same scale, they connect in ways the ear recognises as movement within one key.",
            },
          ],
        },
        {
          title: "Small Shapes, Big Ideas",
          description: "Triads are the smallest complete major and minor chord sounds, making them practical building blocks for understanding richer harmony.",
          points: [
            {
              label: "Clear structure:",
              text: "With only three voices, it is easier to hear which notes stay in place and which notes move between chords.",
            },
            {
              label: "Room to grow:",
              text: "Larger chords add colour to this foundation, so strong triad knowledge makes extended harmony easier to navigate.",
            },
          ],
        },
        {
          title: "Why It Matters",
          points: [
            {
              label: "Fretboard knowledge:",
              text: "Triads reveal chord tones in connected locations instead of isolated shapes.",
            },
            {
              label: "Voice leading:",
              text: "Nearby shapes help individual notes move smoothly from one chord to the next.",
            },
            {
              label: "Chord progressions:",
              text: "Seeing shared tones makes common harmonic movement easier to understand and arrange.",
            },
            {
              label: "Improvisation:",
              text: "Targeting chord tones helps solos follow the harmony rather than simply running through a scale.",
            },
          ],
        },
      ] as ConceptGroup[],
      closing: "Listen for these connections in music you already know.",
    },
  ],
};

export function WelcomeCard() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  function toggleSection(sectionId: string) {
    setExpandedSections((current) => current.includes(sectionId)
      ? current.filter((id) => id !== sectionId)
      : [...current, sectionId]);
  }

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-xl font-black text-zinc-950">{welcomeContent.title}</h2>
      <div className="mt-3 grid gap-3 text-sm leading-6 text-zinc-600">
        {welcomeContent.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-2">
        {welcomeContent.sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const contentId = `${section.id}-content`;

          return (
            <div className="border-b border-zinc-100 last:border-b-0" key={section.id}>
              <button
                aria-controls={contentId}
                aria-expanded={isExpanded}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 hover:text-teal-800"
                onClick={() => toggleSection(section.id)}
                type="button"
              >
                <ChevronRight
                  aria-hidden="true"
                  className={`shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
                  size={17}
                />
                {section.title}
              </button>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
                id={contentId}
              >
                <div className="overflow-hidden">
                  <div className="px-2 pb-3 pt-3 text-sm leading-6 text-zinc-600 sm:pl-8">
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.groups.map((group) => (
                        <section className="rounded-md border border-zinc-100 bg-zinc-50 p-4" key={group.title}>
                          <h3 className="text-xs font-black uppercase tracking-[0.12em] text-teal-800">
                            {group.title}
                          </h3>
                          {group.description && <p className="mt-2">{group.description}</p>}
                          {group.stringGroups && (
                            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                              {group.stringGroups.map((stringGroup) => (
                                <div className="flex items-center gap-2 rounded border border-zinc-200 bg-white px-2.5 py-1.5" key={stringGroup.strings}>
                                  <dt className="font-black tabular-nums text-zinc-900">{stringGroup.strings}</dt>
                                  <dd className="text-zinc-500">— {stringGroup.notes}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          {group.inversions && (
                            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Triad inversions">
                              {group.inversions.map((inversion) => (
                                <li className="rounded border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-700" key={inversion}>
                                  {inversion}
                                </li>
                              ))}
                            </ul>
                          )}
                          {group.points && (
                            <ul className="mt-3 grid gap-2.5">
                              {group.points.map((point) => (
                                <li key={point.label}>
                                  <strong className="font-bold text-zinc-800">{point.label}</strong>{" "}
                                  {point.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      ))}
                    </div>
                    <p className="mt-5 font-bold text-zinc-900">{section.closing}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
