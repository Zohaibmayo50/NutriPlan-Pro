import { useEffect, useState } from 'react';

/**
 * FormattedPlan Component
 * 
 * Displays AI-generated diet plans in a professional, structured format:
 * - Section titles as headings
 * - Meal plans as tables (Meal | Foods | Portions | Notes)
 * - Guidelines and recommendations as bullet lists
 * - Clean black text on white background for printing/PDF
 */
export default function FormattedPlan({ planContent }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!planContent) return;
    
    // Parse the plan content into structured sections
    const parsed = parsePlanContent(planContent);
    setSections(parsed);
  }, [planContent]);

  /**
   * Parse AI-generated text into structured sections
   * Detects meal plans, guidelines, and regular text blocks
   */
  const parsePlanContent = (content) => {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    let currentMealTable = null;
    let currentList = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines between sections
      if (!trimmedLine) {
        if (currentMealTable) {
          currentSection.mealTable = currentMealTable;
          currentMealTable = null;
        }
        if (currentList) {
          currentSection.list = currentList;
          currentList = null;
        }
        return;
      }

      // Detect section headings (lines with colons or all caps)
      const isHeading = 
        /^(DAY \d+|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)/i.test(trimmedLine) ||
        /^[A-Z\s]+:/.test(trimmedLine) ||
        /^#{1,3}\s/.test(trimmedLine) ||
        (trimmedLine.length < 60 && trimmedLine === trimmedLine.toUpperCase() && /[A-Z]/.test(trimmedLine));

      if (isHeading) {
        // Save previous section
        if (currentSection) {
          if (currentMealTable) currentSection.mealTable = currentMealTable;
          if (currentList) currentSection.list = currentList;
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          type: 'heading',
          title: trimmedLine.replace(/^#{1,3}\s/, '').replace(/:$/, ''),
          content: []
        };
        currentMealTable = null;
        currentList = null;
        return;
      }

      // Detect meal entries (Breakfast, Lunch, Dinner, Snack)
      const mealMatch = trimmedLine.match(/^(Breakfast|Lunch|Dinner|Snack|Mid-Morning|Evening|Pre-Workout|Post-Workout)[:\s-]/i);
      if (mealMatch) {
        if (!currentMealTable) {
          currentMealTable = [];
        }
        
        const mealType = mealMatch[1];
        const mealContent = trimmedLine.substring(mealMatch[0].length).trim();
        
        // Parse meal content (foods, portions, notes)
        const parts = mealContent.split(/[;|]/).map(p => p.trim()).filter(p => p);
        
        currentMealTable.push({
          meal: mealType,
          foods: parts[0] || mealContent,
          portions: parts[1] || '',
          notes: parts[2] || ''
        });
        return;
      }

      // Detect list items (bullets, numbers, or dashes)
      const isListItem = /^[-•*]\s/.test(trimmedLine) || /^\d+[\.)]\s/.test(trimmedLine);
      if (isListItem) {
        if (!currentList) {
          currentList = [];
        }
        currentList.push(trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+[\.)]\s/, ''));
        return;
      }

      // Regular content
      if (currentSection) {
        if (currentMealTable) {
          currentSection.mealTable = currentMealTable;
          currentMealTable = null;
        }
        if (currentList) {
          currentSection.list = currentList;
          currentList = null;
        }
        currentSection.content.push(trimmedLine);
      } else {
        // Create a default section for content without heading
        currentSection = {
          type: 'text',
          content: [trimmedLine]
        };
      }
    });

    // Add final section
    if (currentSection) {
      if (currentMealTable) currentSection.mealTable = currentMealTable;
      if (currentList) currentSection.list = currentList;
      sections.push(currentSection);
    }

    return sections;
  };

  if (!planContent) {
    return (
      <div className="text-center py-8 text-gray-500">
        No plan content available
      </div>
    );
  }

  return (
    <div className="formatted-plan space-y-6">
      {sections.map((section, idx) => (
        <div key={idx} className="section">
          {/* Section Heading */}
          {section.title && (
            <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-300">
              {section.title}
            </h3>
          )}

          {/* Meal Table */}
          {section.mealTable && section.mealTable.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      Meal
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      Foods
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      Portions
                    </th>
                    {section.mealTable.some(m => m.notes) && (
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                        Notes
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {section.mealTable.map((meal, mealIdx) => (
                    <tr key={mealIdx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                        {meal.meal}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">
                        {meal.foods}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">
                        {meal.portions}
                      </td>
                      {section.mealTable.some(m => m.notes) && (
                        <td className="border border-gray-300 px-4 py-2 text-gray-600 text-sm">
                          {meal.notes}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bullet List */}
          {section.list && section.list.length > 0 && (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-800">
              {section.list.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Regular Content */}
          {section.content && section.content.length > 0 && (
            <div className="prose max-w-none text-gray-800 leading-relaxed">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Print Styles */}
      <style>{`
        @media print {
          .formatted-plan {
            color: #000;
            background: #fff;
          }
          .formatted-plan table {
            page-break-inside: avoid;
          }
          .formatted-plan .section {
            page-break-inside: avoid;
          }
          .formatted-plan h3 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
