import { useData } from '@/state/DataProvider'
import SubscriptionsCard from './SubscriptionsCard'

export default function OptimizeTab() {
  const { txns } = useData()
  return <SubscriptionsCard txns={txns} />
}
