import { useState } from "react";
import { ChevronRight } from "lucide-react";

const welcomeContent = {
  title: "Welcome to Guitar Practice Tool",
  introduction: [
    "This tool is best suited for intermediate guitarists looking to move beyond open chords and barre chords, and develop a deeper understanding of harmony across the entire fretboard.",
    "Welcome to Guitar Practice Tool for learning the guitar fretboard.",
    "The focus of this application is on Triads, Scales and Harmony. Harmony can seem like a deep and intimidating topic at first, but routine practice, deliberate repetition and active thinking will gradually reinforce your understanding and help you become a more confident musician.",
    "The interactive fretboard below is the core of the application. It allows you to quickly visualise triad and scale shapes in any key while manually tracking your practice progress over time.",
  ],
  sections: [
    {
      id: "key-concepts",
      title: "Key Concepts",
      items: [
        { text: "Simplified: Any chord can be played in 12 different triad shapes across the guitar fretboard." },
        { text: "A triad is a three-note chord built from the 1st, 3rd and 5th degrees of a scale." },
        { text: "Three notes are played across three adjacent strings." },
        {
          text: "The six guitar strings can therefore be divided into four string groups:",
          children: ["EAD", "ADG", "DGB", "GBE"],
        },
        {
          text: "Each string group contains three inversions of every triad:",
          children: ["Root Position", "1st Inversion", "2nd Inversion"],
        },
        { text: "To build confidence with harmony, practise every inversion across every string group." },
        { text: "As you practise, pay attention to the inversion number and the lowest note (bass note) of each shape. This is one of the easiest ways to understand why each inversion has its name." },
        { text: "Use the counters beside each string group to manually track your successful practice repetitions." },
        { text: "Visit the Progress page to review your overall practice summary." },
      ],
      closing: "Now get practising! 🎸",
    },
  ],
};

export function WelcomeCard() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-xl font-black text-zinc-950">{welcomeContent.title}</h2>
      <div className="mt-3 grid gap-3 text-sm leading-6 text-zinc-600">
        {welcomeContent.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-2">
        {welcomeContent.sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const contentId = `${section.id}-content`;

          return (
            <div key={section.id}>
              <button
                aria-controls={contentId}
                aria-expanded={isExpanded}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 hover:text-teal-800"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
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
                  <div className="px-3 pb-3 pl-8 pt-2 text-sm leading-6 text-zinc-600">
                    <ul className="list-disc space-y-2 pl-5">
                      {section.items.map((item) => (
                        <li key={item.text}>
                          {item.text}
                          {item.children && (
                            <ul className="mt-1 list-disc space-y-0.5 pl-5">
                              {item.children.map((child) => <li key={child}>{child}</li>)}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 font-bold text-zinc-900">{section.closing}</p>
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
