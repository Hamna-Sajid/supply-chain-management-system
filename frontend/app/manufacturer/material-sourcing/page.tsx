'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Check } from 'lucide-react';

const suppliers = [
  { id: 1, name: 'Steel Co Ltd', material: 'Steel Sheets', price: '$25.50/unit', rating: 4.8, inCart: false },
  { id: 2, name: 'Aluminum Ltd', material: 'Aluminum Bars', price: '$18.75/unit', rating: 4.6, inCart: false },
  { id: 3, name: 'Copper Works', material: 'Copper Wire', price: '$42.00/unit', rating: 4.9, inCart: false },
  { id: 4, name: 'Polymer Co', material: 'Plastic Pellets', price: '$8.50/unit', rating: 4.3, inCart: false },
  { id: 5, name: 'E-Comp Ltd', material: 'Electronics', price: '$150.00/unit', rating: 4.7, inCart: false },
];

export default function MaterialSourcingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierList, setSupplierList] = useState(suppliers);

  const filteredSuppliers = supplierList.filter(s => 
    s.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (id: number) => {
    setSupplierList(supplierList.map(s => 
      s.id === id ? { ...s, inCart: !s.inCart } : s
    ));
  };

  const cartCount = supplierList.filter(s => s.inCart).length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Material Sourcing</h1>
        <p className="text-gray-600 mt-2">Browse and purchase raw materials from suppliers</p>
      </div>

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Browse Suppliers</CardTitle>
          <CardDescription>Find materials from verified suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by material or supplier name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <Button style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Material</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Rating</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{supplier.name}</td>
                    <td className="py-3 px-4 text-gray-700">{supplier.material}</td>
                    <td className="py-3 px-4 text-[#2D6A4F] font-semibold">{supplier.price}</td>
                    <td className="py-3 px-4 text-gray-700">★ {supplier.rating}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(supplier.id)}
                        style={{ 
                          backgroundColor: supplier.inCart ? '#40916C' : '#B7E4C7',
                          color: supplier.inCart ? 'white' : '#2D6A4F'
                        }}
                        className="flex items-center gap-1 mx-auto"
                      >
                        {supplier.inCart ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add to Order
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cartCount > 0 && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#D8F3DC', borderColor: '#B7E4C7', borderWidth: '1px' }}>
              <p className="text-[#2D6A4F] font-semibold">{cartCount} item(s) added to order. Ready to checkout?</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
