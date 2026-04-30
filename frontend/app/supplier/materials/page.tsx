'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { supplierApi, Material, AddMaterialPayload } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function MaterialsCatalogPage() {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState<{
    material_name: string;
    description: string;
    quantity_available: string;
    unit_price: string;
  }>({
    material_name: '',
    description: '',
    quantity_available: '',
    unit_price: '',
  });

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await supplierApi.getMaterials();
      setMaterials(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMaterials(); }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddMaterial = async () => {
    setFormError('');
    if (!form.material_name.trim()) { setFormError('Material name is required.'); return; }
    if (!form.quantity_available) { setFormError('Quantity is required.'); return; }
    if (!form.unit_price) { setFormError('Unit price is required.'); return; }

    const qty = parseInt(form.quantity_available);
    const price = parseFloat(form.unit_price);
    if (isNaN(qty) || qty < 0) { setFormError('Quantity must be a non-negative number.'); return; }
    if (isNaN(price) || price < 0) { setFormError('Unit price must be a non-negative number.'); return; }

    setSubmitting(true);
    try {
      const payload: AddMaterialPayload = {
        material_name: form.material_name.trim(),
        description: form.description.trim() || undefined,
        quantity_available: qty,
        unit_price: price,
      };

      if (editingId) {
        // Update mode
        await supplierApi.updateMaterial(editingId, payload);
        toast({ title: 'Material updated', description: `${form.material_name} was updated successfully.` });
        setEditingId(null);
      } else {
        // Add mode
        await supplierApi.addMaterial(payload);
        toast({ title: 'Material added', description: `${form.material_name} was added successfully.` });
      }

      setForm({ material_name: '', description: '', quantity_available: '', unit_price: '' });
      await loadMaterials();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.material_id);
    setForm({
      material_name: material.material_name,
      description: material.description || '',
      quantity_available: String(material.quantity_available),
      unit_price: String(material.unit_price),
    });
    setFormError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ material_name: '', description: '', quantity_available: '', unit_price: '' });
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    setDeleting(id);
    try {
      await supplierApi.deleteMaterial(id);
      toast({ title: 'Material deleted', description: 'Material was deleted successfully.' });
      await loadMaterials();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete material' });
    } finally {
      setDeleting(null);
    }
  };

  const fmt = (createdAt?: string, updatedAt?: string) => {
    const value = createdAt || updatedAt;
    if (!value) return '—';
    try { return new Date(value).toLocaleDateString(); }
    catch { return value; }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Materials Catalog</h1>
        <p className="text-gray-600 mt-2">Manage your raw materials inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Material */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#2D6A4F]" />
              {editingId ? 'Edit Material' : 'Add New Material'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Name *</label>
              <Input
                name="material_name"
                value={form.material_name}
                onChange={handleInput}
                placeholder="e.g. Raw Aluminum"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInput}
                placeholder="Optional description"
                className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                style={{ borderColor: '#B7E4C7' }}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
              <Input
                name="quantity_available"
                type="number"
                min="0"
                value={form.quantity_available}
                onChange={handleInput}
                placeholder="e.g. 500"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($) *</label>
              <Input
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={form.unit_price}
                onChange={handleInput}
                placeholder="e.g. 25.50"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <Button
              onClick={handleAddMaterial}
              disabled={submitting}
              className="w-full text-white"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              {submitting ? (editingId ? 'Updating…' : 'Adding…') : (editingId ? 'Update Material' : 'Add Material')}
            </Button>

            {editingId && (
              <Button
                onClick={handleCancelEdit}
                disabled={submitting}
                variant="outline"
                className="w-full"
              >
                Cancel Edit
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Catalog Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Complete Material Catalog</CardTitle>
              <CardDescription>{materials.length} material{materials.length !== 1 ? 's' : ''} in catalog</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                  <Button size="sm" variant="outline" onClick={loadMaterials} className="ml-auto">Retry</Button>
                </div>
              ) : materials.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">
                  No materials yet. Add your first material using the form.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Quantity</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Unit Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Added</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map(m => (
                        <tr
                          key={m.material_id}
                          style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">{m.material_name}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px] truncate">
                            {m.description || '—'}
                          </td>
                          <td className="py-3 px-4 text-gray-700">{m.quantity_available.toLocaleString()}</td>
                          <td className="py-3 px-4 font-semibold text-[#2D6A4F]">
                            ${Number(m.unit_price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {fmt(m.created_at, m.updated_at)}
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => handleEdit(m)}
                              disabled={submitting}
                              className="p-1 text-[#2D6A4F] hover:bg-gray-200 rounded transition disabled:opacity-50"
                              title="Edit material"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.material_id)}
                              disabled={deleting === m.material_id}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition disabled:opacity-50"
                              title="Delete material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
