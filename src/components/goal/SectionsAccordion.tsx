import type { Goal } from "@/types"
import { GOAL_SECTIONS } from "@/config/goalSections"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionBulletList } from "./SectionBulletList"

type Props = { goal: Goal }

export function SectionsAccordion({ goal }: Props) {
  return (
    <Accordion type="multiple" className="w-full">
      {GOAL_SECTIONS.map((section) => {
        const bullets = goal.sections[section.id] ?? []
        const filled = bullets.some((b) => b.trim().length > 0)
        return (
          <AccordionItem key={section.id} value={section.id} className="not-last:border-b-0">
            <AccordionTrigger className="text-base font-medium">
              <span className="flex items-center gap-2">
                {section.label}
                {filled && (
                  <span className="size-1.5 rounded-full bg-accent-action" />
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pl-6">
              <SectionBulletList
                goalId={goal.id}
                sectionId={section.id}
                label={section.label}
                bullets={bullets}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
