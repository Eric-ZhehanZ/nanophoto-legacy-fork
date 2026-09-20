import { getTagCatalog } from '@/tag/catalog-server';
import AdminTagsTable from '@/admin/AdminTagsTable';
import AppGrid from '@/components/AppGrid';
import { getUniqueTags } from '@/photo/query';

export default async function AdminTagsPage() {
  const used = await getUniqueTags(true);
  const catalog = await getTagCatalog();
  const tags = catalog.map(t => ({ ...t,
    count: used.find(u => u.tag === t.tag)?.count || 0,
    lastModified: new Date(),
  }));

  return (
    <AppGrid
      contentMain={
        <div className="space-y-6">
          <div className="space-y-4">
            <AdminTagsTable {...{ tags }} />
          </div>
        </div>}
    />
  );
}
