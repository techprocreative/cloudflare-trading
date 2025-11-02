import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSignalStore } from '@/store/signalStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, XCircle, History } from 'lucide-react';
import { cn } from '@/lib/utils';
export function TradeHistory() {
  const trades = useSignalStore((state) => state.trades);
  return (
    <Card className="border-white/10 bg-gray-800/50 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-gray-300">Trade History</CardTitle>
        <History className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
          <div className="space-y-3 pr-4">
            <AnimatePresence>
              {trades.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500"
                >
                  <p>No trades executed yet.</p>
                  <p className="mt-1 text-xs">Ask the AI to execute a trade.</p>
                </motion.div>
              )}
              {trades.map((trade) => (
                <motion.div
                  key={trade.id}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex items-center justify-between rounded-md bg-gray-900/50 p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                        trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {trade.action === 'BUY' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {trade.action} {trade.pair}
                      </p>
                      <p className="text-gray-400">
                        {trade.amount.toLocaleString()} @ {trade.price.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                        trade.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {trade.status === 'FAILED' && <XCircle className="h-3 w-3" />}
                      {trade.status}
                    </div>
                    <p className="mt-1 text-gray-500">{trade.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}