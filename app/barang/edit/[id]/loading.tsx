// app/barang/edit/[id]/loading.tsx - Alternatif tanpa Skeleton
import { Card } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="h-10 w-32 bg-gray-200 rounded mb-8 animate-pulse"></div>
      
      <div className="mb-12">
        <div className="h-10 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          {/* Form fields skeleton dengan div biasa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="flex gap-4 pt-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}