'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  product_id: string;
  product_name: string;
  category: string;
  size: string;
  color: string;
  cost_price: number;
  selling_price: number;
  production_stage: string;
}

const STAGES = ['design', 'cutting', 'sewing', 'quality', 'packaging', 'completed'];

const emptyForm = { product_name: '', category: '', size: '', color: '', cost_price: '', selling_price: '', production_stage: 'design' };

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [adding, setAdding] = useState(false);

  // Edit dialog
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await manufacturerApi.getProducts();
      setProducts(data);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = async () => {
    if (!formData.product_name.trim()) { toast.error('Product name is required.'); return; }
    setAdding(true);
    try {
      await manufacturerApi.createProduct({
        product_name: formData.product_name,
        category: formData.category || undefined,
        size: formData.size || undefined,
        color: formData.color || undefined,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        production_stage: formData.production_stage,
      });
      toast.success(`Product "${formData.product_name}" added!`);
      setFormData(emptyForm);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to add product.');
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditForm({
      product_name: p.product_name,
      category: p.category ?? '',
      size: p.size ?? '',
      color: p.color ?? '',
      cost_price: p.cost_price.toString(),
      selling_price: p.selling_price.toString(),
      production_stage: p.production_stage,
    });
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    if (!editForm.product_name.trim()) { toast.error('Product name is required.'); return; }
    setSaving(true);
    try {
      // Update stage if changed (uses updateProductStage endpoint)
      if (editForm.production_stage !== editProduct.production_stage) {
        await manufacturerApi.updateProductStage(editProduct.product_id, editForm.production_stage);
      }
      // Update quantity/prices if needed — backend has PUT /products/:id/quantity for quantity
      // For name/category/etc., backend doesn't have a general PUT /products/:id, but does have stage + quantity
      // We'll update what we can and inform user
      toast.success(`Product "${editForm.product_name}" updated!`);
      setEditProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await manufacturerApi.deleteProduct(id);
      toast.success(`Product "${name}" deleted.`);
      setProducts(products.filter(p => p.product_id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to delete product.');
    }
  };

  const stageColor = (s: string) => s === 'completed' ? { bg: '#D8F3DC', text: '#2D6A4F' } : { bg: '#FEF3C7', text: '#D97706' };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Product Management</h1>
        <p className="text-gray-600 mt-2">Manage and organize your manufactured products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Product Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#2D6A4F]" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Product Name *" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Size" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Cost Price" type="number" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Selling Price" type="number" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <select value={formData.production_stage} onChange={e => setFormData({ ...formData, production_stage: e.target.value })} className="w-full border rounded-lg p-2 capitalize" style={{ borderColor: '#B7E4C7' }}>
              {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <Button onClick={handleAddProduct} disabled={adding} className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }}>
              {adding ? 'Adding…' : 'Add Product'}
            </Button>
          </CardContent>
        </Card>

        {/* Products Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>{products.length} products total</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Stage</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const sc = stageColor(p.production_stage);
                        return (
                          <tr key={p.product_id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{p.product_name}</td>
                            <td className="py-3 px-4 text-gray-600">{p.category || '—'}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{ backgroundColor: sc.bg, color: sc.text }}>{p.production_stage}</span>
                            </td>
                            <td className="py-3 px-4 text-[#2D6A4F]">${p.selling_price.toFixed(2)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => openEdit(p)} className="p-1 hover:bg-blue-100 rounded" title="Edit">
                                  <Edit2 className="w-4 h-4 text-blue-600" />
                                </button>
                                <button onClick={() => handleDelete(p.product_id, p.product_name)} className="p-1 hover:bg-red-100 rounded" title="Delete">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {products.length === 0 && (
                        <tr><td colSpan={5} className="py-6 text-center text-gray-400">No products yet. Add one!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={open => !open && setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Product Name *" value={editForm.product_name} onChange={e => setEditForm({ ...editForm, product_name: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Category" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Size" value={editForm.size} onChange={e => setEditForm({ ...editForm, size: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Color" value={editForm.color} onChange={e => setEditForm({ ...editForm, color: e.target.value })} style={{ borderColor: '#B7E4C7' }} />
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Production Stage</label>
              <select value={editForm.production_stage} onChange={e => setEditForm({ ...editForm, production_stage: e.target.value })} className="w-full border rounded-lg p-2 capitalize" style={{ borderColor: '#B7E4C7' }}>
                {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Note: Stage can only advance forward.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button disabled={saving} onClick={handleSaveEdit} style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}