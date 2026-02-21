'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Item } from '@/types';
import ItemForm from '@/components/admin/ItemForm';
import AdminGuard from '@/components/admin/AdminGuard';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useSWR<Item>(id ? `/items/${id}` : null, fetcher);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="skeleton h-8 w-48 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="skeleton h-64 rounded-2xl" />
              <div className="skeleton h-48 rounded-2xl" />
            </div>
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (!item) {
    return (
      <AdminGuard>
        <div className="p-6 text-center text-gray-400">Item not found.</div>
      </AdminGuard>
    );
  }

  return <ItemForm item={item} isEditing />;
}
