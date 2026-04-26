'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus, AlertCircle } from 'lucide-react';
import { supplierApi, Material } from '@/lib/api';

export default function MaterialsCatalogPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    material_name: '',
    description: '',
    quantity_available: '',
    unit_price: '',
  });

  // ─── Load materials ──────────────────────────────────────────────────────────
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

  // ─── Form handlers ───────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateMaterial = async () => {
    setFormError('');
    if (!formData.material_name || !formData.quantity_available || !formData.unit_price) {
      setFormError('Name, quantity and unit price are required.');
      return;
    }
    setSubmitting(true);
    try {
      await supplierApi.addMaterial({
        material_name: formData.material_name,
        quantity_available: parseInt(formData.quantity_available),
        unit_price: parseFloat(formData.unit_price),
      });
      setFormData({ material_name: '', description: '', quantity_available: '', unit_price: '' });
      await loadMaterials();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Materials Catalog</h1>
        <p className="text-gray-600 mt-2">Manage your raw materials inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Material Form */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#2D6A4F]" />
              Add New Raw Material
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
              <Input
                name="material_name"
                value={formData.material_name}
                onChange={handleInputChange}
                placeholder="Enter material name"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter material description"
                className="w-full border rounded-lg p-2"
                style={{ borderColor: '#B7E4C7' }}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
              <Input
                name="quantity_available"
                type="number"
                min="0"
                value={formData.quantity_available}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
              <Input
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={handleInputChange}
                placeholder="Enter unit price"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <Button
              onClick={handleCreateMaterial}
              disabled={submitting}
              className="w-full text-white"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              {submitting ? 'Creating…' : 'Create Material'}
            </Button>
          </CardContent>
        </Card>

        {/* Material Catalog Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Complete Material Catalog</CardTitle>
              <CardDescription>{materials.length} materials in inventory</CardDescription>
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
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Quantity</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Unit Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Last Updated</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr
                          key={material.id}
                          style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-gray-900 font-medium">{material.material_name}</td>
                          <td className="py-3 px-4 text-gray-700">{material.quantity_available}</td>
                          <td className="py-3 px-4 text-gray-700">${material.unit_price}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {material.updated_at
                              ? new Date(material.updated_at).toLocaleDateString()
                              : material.created_at
                              ? new Date(material.created_at).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button className="p-1 hover:bg-red-100 rounded transition-colors">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
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
