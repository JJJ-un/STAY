import { Tabs, type TabItem } from '@/shared/ui'

export type MainTabType = 'RECOMMEND' | 'COMMUNITY'

const MAIN_TAB_ITEMS: TabItem<MainTabType>[] = [
  { id: 'RECOMMEND', label: '추천 다짐' },
  { id: 'COMMUNITY', label: '다른 사람들 피드' },
]

interface MainTabProps {
  activeTab: MainTabType
  onTabChange: (tab: MainTabType) => void
}

export function MainTab({ activeTab, onTabChange }: MainTabProps) {
  const handleTabChange = (tab: MainTabType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onTabChange(tab)
  }

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4">
      <Tabs<MainTabType>
        items={MAIN_TAB_ITEMS}
        activeId={activeTab}
        onChange={handleTabChange}
        variant="underline"
      />
    </div>
  )
}
