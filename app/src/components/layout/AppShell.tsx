import { useData } from '@/state/DataProvider'
import { useHashParam } from '@/state/hash'
import { coverage } from '@/lib/aggregate'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import OverviewTab from '@/features/overview/OverviewTab'
import TransactionsTab from '@/features/transactions/TransactionsTab'
import CategoriesTab from '@/features/categories/CategoriesTab'
import RulesTab from '@/features/rules/RulesTab'
import OptimizeTab from '@/features/optimize/OptimizeTab'
import ImportButton from '@/features/import/ImportButton'

export default function AppShell() {
  const { txns } = useData()
  const { otherCount } = coverage(txns)
  const [tab, setTab] = useHashParam('tab', 'overview')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <span className="text-lg font-semibold tracking-tight">RtxData</span>
          {otherCount > 0 && (
            <span className="num rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {otherCount.toLocaleString('ru-RU')} без категории
            </span>
          )}
          <div className="ml-auto">
            <ImportButton variant="outline" label="Загрузить .json" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {txns.length === 0 ? (
          <div className="mx-auto max-w-md space-y-4 py-20 text-center">
            <h2 className="text-xl font-semibold">Нет данных</h2>
            <p className="text-muted-foreground">
              Импортируйте выписку Raiffeisen (<code className="num text-sm">Raiff_*.json</code>). Данные
              остаются в браузере и никуда не отправляются.
            </p>
            <ImportButton label="Импортировать файл" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={v => setTab(String(v))}>
            <TabsList>
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="transactions">Транзакции</TabsTrigger>
              <TabsTrigger value="categories">По категориям</TabsTrigger>
              <TabsTrigger value="rules">Правила</TabsTrigger>
              <TabsTrigger value="optimize">Оптимизация</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionsTab />
            </TabsContent>
            <TabsContent value="categories">
              <CategoriesTab />
            </TabsContent>
            <TabsContent value="rules">
              <RulesTab />
            </TabsContent>
            <TabsContent value="optimize">
              <OptimizeTab />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
